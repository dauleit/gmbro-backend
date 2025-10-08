import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, Schema } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { TransactionWebhook, TransactionWebhookDocument } from './schemas/transaction-webhook.schema';
import { IResponseData } from 'src/base/base-controller';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';
import { InternalServerErrorException } from 'src/common/exceptions/internal-server-error.exception';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { ITransaction } from './interfaces/transaction.interface';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { CircleWebhookDto } from './dto/circle-webhook.dto';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(TransactionWebhook.name) private readonly transactionWebhookModel: Model<TransactionWebhookDocument>,
    private readonly userService: UserService,
    private readonly walletService: WalletService
  ) {}

  async create(transactionData: CreateTransactionDto): Promise<IResponseData> {
    try {
      this.logger.log('Creating new transaction...');

      const transactionToSave = {
        ...transactionData,
        user: transactionData.user ? new Types.ObjectId(transactionData.user) : undefined,
        payment: transactionData.payment ? new Types.ObjectId(transactionData.payment) : undefined,
        wallet: transactionData.wallet ? new Types.ObjectId(transactionData.wallet) : undefined
      };

      const newTransaction = new this.transactionModel(transactionToSave);
      const savedTransaction = await newTransaction.save();

      return {
        message: ERROR_MESSAGES.common.CREATED,
        data: { transaction: savedTransaction }
      };
    } catch (error) {
      this.logger.error('Error creating transaction:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async findAll(userId?: string, page?: number, limit?: number): Promise<IResponseData> {
    try {
      this.logger.log('Getting all transactions...');

      const filter: any = {};
      if (userId) filter.user = new Types.ObjectId(userId);
      const wallet = await this.walletService.findByUser(userId);
      const transactionsQuery = this.transactionModel.find(filter).sort({ createdAt: -1 });
      let transactions = [];
      if (limit !== -1) {
        transactions = await transactionsQuery
          .limit(limit)
          .skip((page - 1) * limit)
          .lean();
      } else {
        transactions = await transactionsQuery.lean();
      }
      transactions = transactions.map((transaction) => {
        if (transaction.destinationAddress === wallet.address) {
          transaction.transactionType = 'INBOUND';
        }
        if (transaction.sourceAddress === wallet.address) {
          transaction.transactionType = 'OUTBOUND';
        }

        return transaction;
      });
      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: { transactions }
      };
    } catch (error) {
      this.logger.error('Error getting transactions:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async findById(transactionId: string): Promise<TransactionDocument> {
    try {
      this.logger.log(`Getting transaction by ID: ${transactionId}`);

      const transaction = await this.transactionModel.findById(transactionId);
      if (!transaction) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.common.NOT_FOUND
        });
      }

      return transaction;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting transaction by ID:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async findByTxHash(txHash: string): Promise<TransactionDocument> {
    try {
      this.logger.log(`Getting transaction by txHash: ${txHash}`);

      const transaction = await this.transactionModel.findOne({ txHash });
      if (!transaction) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.common.NOT_FOUND
        });
      }

      return transaction;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting transaction by txHash:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async update(transactionId: string, updateData: ITransaction): Promise<IResponseData> {
    try {
      this.logger.log(`Updating transaction: ${transactionId}`);

      const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
        transactionId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedTransaction) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.common.NOT_FOUND
        });
      }

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: { transaction: updatedTransaction }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating transaction:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async delete(transactionId: string): Promise<IResponseData> {
    try {
      this.logger.log(`Deleting transaction: ${transactionId}`);

      const deletedTransaction = await this.transactionModel.findByIdAndDelete(transactionId);

      if (!deletedTransaction) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.common.NOT_FOUND
        });
      }

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: { transaction: deletedTransaction }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting transaction:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getUserTransactions(userId: string, limit = 10, offset = 0): Promise<IResponseData> {
    try {
      this.logger.log(`Getting transactions for user: ${userId}`);

      const transactions = await this.transactionModel.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).skip(offset).lean();

      const total = await this.transactionModel.countDocuments({ user: userId });

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          transactions,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          }
        }
      };
    } catch (error) {
      this.logger.error('Error getting user transactions:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getWalletTransactions(walletId: string, limit = 10, offset = 0): Promise<IResponseData> {
    try {
      this.logger.log(`Getting transactions for wallet: ${walletId}`);

      const transactions = await this.transactionModel.find({ wallet: walletId }).sort({ createdAt: -1 }).limit(limit).skip(offset).lean();

      const total = await this.transactionModel.countDocuments({ wallet: walletId });

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          transactions,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          }
        }
      };
    } catch (error) {
      this.logger.error('Error getting wallet transactions:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async processCircleWebhook(webhookData: CircleWebhookDto, headers: any): Promise<IResponseData> {
    try {
      this.logger.log('=== CIRCLE TRANSACTION WEBHOOK RECEIVED ===');
      this.logger.log('Headers:', JSON.stringify(headers, null, 2));
      this.logger.log('Webhook Data:', JSON.stringify(webhookData, null, 2));

      // Save webhook data first
      const webhookRecord = new this.transactionWebhookModel({
        subscriptionId: webhookData.subscriptionId,
        notificationId: webhookData.notificationId,
        notificationType: webhookData.notificationType,
        notification: webhookData.notification,
        timestamp: webhookData.timestamp,
        version: webhookData.version,
        headers: headers,
        rawData: webhookData,
        processed: false
      });

      const savedWebhook = await webhookRecord.save();
      this.logger.log(`Webhook saved with ID: ${savedWebhook._id}`);

      // Create or update transaction
      const notification = webhookData.notification;
      const existingTransaction = await this.transactionModel.findOne({
        circleTransactionId: notification.id
      });

      if (existingTransaction) {
        // Update existing transaction
        existingTransaction.status = notification.state;
        existingTransaction.txHash = notification.txHash;
        existingTransaction.networkFee = notification.networkFee;
        existingTransaction.errorReason = notification.errorReason;
        existingTransaction.errorDetails = notification.errorDetails;
        existingTransaction.userOpHash = notification.userOpHash;
        existingTransaction.updatedBy = savedWebhook._id;
        existingTransaction.refId = notification.refId || '';

        await existingTransaction.save();
        this.logger.log(`Updated existing transaction: ${existingTransaction._id}`);

        // Update webhook with related transaction
        savedWebhook.relatedTransaction = existingTransaction._id;
        savedWebhook.processed = true;
        savedWebhook.processedAt = new Date();
        await savedWebhook.save();
      } else {
        // Create new transaction
        const user = await this.userService.findByCircleUserId(notification.userId);
        const wallet = await this.walletService.findByCircleWalletId(notification.walletId);
        const newTransaction = new this.transactionModel({
          user: user._id || null,
          wallet: wallet._id || null,
          circleTransactionId: notification.id,
          blockchain: notification.blockchain,
          tokenId: notification.tokenId,
          txHash: notification.txHash,
          sourceAddress: notification.sourceAddress,
          destinationAddress: notification.destinationAddress,
          amounts: notification.amounts[0],
          nftTokenIds: notification.nftTokenIds,
          status: notification.state,
          errorReason: notification.errorReason,
          errorDetails: notification.errorDetails,
          networkFee: notification.networkFee,
          transactionType: notification.transactionType,
          createdBy: savedWebhook._id,
          userOpHash: notification.userOpHash || '',
          refId: notification.refId || ''
        });

        const savedTransaction = await newTransaction.save();
        this.logger.log(`Created new transaction: ${savedTransaction._id}`);

        // Update webhook with related transaction
        savedWebhook.relatedTransaction = savedTransaction._id;
        savedWebhook.processed = true;
        savedWebhook.processedAt = new Date();
        await savedWebhook.save();
      }

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          received: true,
          webhookId: savedWebhook._id,
          processed: true
        }
      };
    } catch (error) {
      this.logger.error('Error processing Circle transaction webhook:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  /**
   * Get transaction by refId
   * @param refId - Reference ID
   * @returns Promise<IResponseData> - Transaction data
   */
  async getTransactionByRefId(refId: string): Promise<IResponseData> {
    try {
      this.logger.log(`Getting transaction by refId: ${refId}`);

      const transaction = await this.transactionModel.findOne({ refId }).populate('user', 'email firstName lastName').populate('wallet', 'walletSetId');

      if (!transaction) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.common.NOT_FOUND
        });
      }

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: { transaction }
      };
    } catch (error) {
      this.logger.error(`Failed to get transaction by refId ${refId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }
}
