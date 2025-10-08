import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transfer, TransferDocument, TransferStatus } from './schemas/transfer.schema';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ITransferResponse } from './interfaces/transfer.interface';
import { CircleService } from 'src/common/modules/circle/circle.service';
import { WalletService } from '../wallet/wallet.service';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';
import { IUser } from '../user/interfaces/user.interface';
import { IResponseData } from 'src/base/base-controller';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(
    @InjectModel(Transfer.name) private readonly transferModel: Model<TransferDocument>,
    private readonly circleService: CircleService,
    private readonly walletService: WalletService
  ) {}

  /**
   * Create a new transfer
   * @param user - The user creating the transfer
   * @param createTransferDto - Transfer data
   * @returns Promise<IResponseData> - Created transfer response
   */
  async createTransfer(user: IUser, createTransferDto: CreateTransferDto): Promise<IResponseData> {
    try {
      this.logger.log(`Creating transfer for user ${user.id}`);

      // Get user's wallet
      const walletResponse = await this.walletService.getMyWallet(user);
      if (!walletResponse || !walletResponse.data || !walletResponse.data.wallet) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.wallet.WALLET_NOT_FOUND
        });
      }

      const wallet = walletResponse.data?.wallet;
      console.log(wallet);
      // Check if user has sufficient balance
      const balance = await this.circleService.getWalletBalance(user.circleUserId, wallet.walletSetId);
      console.log(balance);
      const transferAmount = parseFloat(createTransferDto.amount);

      if (balance < transferAmount) {
        throw new BadRequestException({
          message: {
            message: 'Insufficient balance for transfer',
            status: 400,
            code: 'INSUFFICIENT_BALANCE'
          }
        });
      }

      // Estimate transfer fee
      const userToken = await this.circleService.getUserToken(user.circleUserId);
      // Create transfer record
      const transferData = {
        userId: user.id,
        walletId: wallet.walletSetId,
        destinationAddress: createTransferDto.destinationAddress,
        amount: createTransferDto.amount,
        tokenId: createTransferDto.tokenId || 'USDC',
        status: TransferStatus.PENDING,
        transactionId: uuidv4(),
        memo: createTransferDto.memo
      };

      const transfer = new this.transferModel(transferData);
      const savedTransfer = await transfer.save();

      this.logger.log(`Transfer created with ID: ${savedTransfer._id}`);

      // Process transfer immediately (approve logic)
      try {
        this.logger.log(`Processing transfer ${savedTransfer._id}`);

        // Update status to processing
        await this.transferModel.findByIdAndUpdate(savedTransfer._id, {
          status: TransferStatus.PROCESSING
        });

        // Create Circle transaction
        const circleTransaction = await this.circleService.createTransaction(
          userToken,
          wallet.walletSetId,
          createTransferDto.destinationAddress,
          createTransferDto.amount,
          createTransferDto.tokenId || 'USDC',
          createTransferDto.fee
        );
        console.log(circleTransaction);

        this.logger.log(`Transfer ${savedTransfer._id} completed successfully`);

        return {
          message: ERROR_MESSAGES.common.SUCCESSFUL,
          data: {
            challengeId: circleTransaction.challengeId
          }
        };
      } catch (processError) {
        this.logger.error(`Failed to process transfer ${savedTransfer._id}:`, processError);

        // Update transfer status to failed
        const failedTransfer = await this.transferModel.findByIdAndUpdate(savedTransfer._id, {
          status: TransferStatus.FAILED,
          errorMessage: processError.message,
          failedAt: new Date()
        });

        return {
          message: ERROR_MESSAGES.common.SUCCESSFUL,
          data: this.mapTransferToResponse(failedTransfer)
        };
      }
    } catch (error) {
      this.logger.error(`Failed to create transfer for user ${user.id}:`, error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
  }

  /**
   * Get transfer by ID
   * @param transferId - Transfer ID
   * @param userId - User ID for authorization
   * @returns Promise<IResponseData> - Transfer response
   */
  async getTransferById(transferId: string, userId: string): Promise<IResponseData> {
    const transfer = await this.transferModel.findOne({ _id: transferId, userId });
    if (!transfer) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.common.NOT_FOUND
      });
    }
    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: this.mapTransferToResponse(transfer)
    };
  }

  /**
   * Get user's transfers
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Promise<IResponseData> - Transfers response
   */
  async getUserTransfers(userId: string, page = 1, limit = 10): Promise<IResponseData> {
    const skip = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      this.transferModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.transferModel.countDocuments({ userId })
    ]);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: {
        transfers: transfers.map((transfer) => this.mapTransferToResponse(transfer)),
        total
      }
    };
  }

  /**
   * Map transfer document to response interface
   * @param transfer - Transfer document
   * @returns ITransferResponse - Mapped response
   */
  /**
   * Estimate transfer fee
   * @param user - Current user
   * @param createTransferDto - Transfer data for estimation
   * @returns Promise<IResponseData> - Fee estimation response
   */
  async estimateFee(user: IUser, createTransferDto: CreateTransferDto): Promise<IResponseData> {
    try {
      this.logger.log(`Estimating transfer fee for user ${user.id}`);

      // Get user's wallet
      const walletResponse = await this.walletService.getMyWallet(user);
      if (!walletResponse || !walletResponse.data || !walletResponse.data.wallet) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.wallet.WALLET_NOT_FOUND
        });
      }

      const wallet = walletResponse.data.wallet;

      // Get user token
      const userToken = await this.circleService.getUserToken(user.circleUserId);

      // Estimate transfer fee
      const feeEstimate = await this.circleService.estimateTransferFee(
        userToken,
        createTransferDto.destinationAddress,
        createTransferDto.amount,
        createTransferDto.tokenId,
        wallet.walletSetId
      );

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          estimatedFee: feeEstimate
        }
      };
    } catch (error) {
      this.logger.error(`Failed to estimate transfer fee for user ${user.id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
  }

  private mapTransferToResponse(transfer: TransferDocument): ITransferResponse {
    return {
      id: transfer._id.toString(),
      userId: transfer.userId,
      walletId: transfer.walletId,
      destinationAddress: transfer.destinationAddress,
      amount: transfer.amount,
      tokenId: transfer.tokenId,
      status: transfer.status,
      transactionId: transfer.transactionId,
      circleTransactionId: transfer.circleTransactionId,
      fee: transfer.fee,
      memo: transfer.memo,
      errorMessage: transfer.errorMessage,
      completedAt: transfer.completedAt,
      failedAt: transfer.failedAt,
      createdAt: (transfer as any).createdAt || new Date(),
      updatedAt: (transfer as any).updatedAt || new Date()
    };
  }
}
