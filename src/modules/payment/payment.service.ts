import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { StripeService } from './stripe.service';
import { CircleService } from './circle.service';
import { WalletService } from '../wallet/wallet.service';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from './schemas/transaction.schema';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { IResponseData } from '../../base/base-controller';
import { ERROR_MESSAGES } from '../../common/constants/errorMessage';
import { InternalServerErrorException } from '../../common/exceptions/internal-server-error.exception';
import { BadRequestException } from '../../common/exceptions/bad-request.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly circleService: CircleService,
    private readonly walletService: WalletService,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>
  ) {}

  async createCheckoutSession(createCheckoutDto: CreateCheckoutDto, userId: string): Promise<IResponseData> {
    try {
      const userWalletAddress = await this.getUserWalletAddress(new Types.ObjectId(userId));
      if (!userWalletAddress) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.common.BAD_REQUEST
        });
      }

      const checkoutSession = await this.stripeService.createCheckoutSession({
        amount: createCheckoutDto.amount,
        currency: 'usd',
        paymentMethodTypes: ['crypto', 'card'],
        metadata: {
          userId,
          type: 'usdc_deposit',
          amount: createCheckoutDto.amount.toString(),
          timestamp: Date.now().toString(),
          walletAddress: userWalletAddress
        },
        successUrl: `${createCheckoutDto.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: createCheckoutDto.cancelUrl
      });

      await this.transactionModel.create({
        userId,
        type: TransactionType.USDC_DEPOSIT,
        amount: createCheckoutDto.amount / 100,
        currency: 'usd',
        stripeSessionId: checkoutSession.id,
        destinationAddress: userWalletAddress
      });

      return {
        message: ERROR_MESSAGES.common.CREATED,
        data: {
          sessionId: checkoutSession.id,
          url: checkoutSession.url,
          status: PaymentStatus.PENDING
        }
      };
    } catch (error) {
      this.logger.error('Error creating checkout session:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async handlePaymentSuccess(chargeId: string): Promise<IResponseData> {
    try {
      const charge = await this.stripeService.getCharge(chargeId);
      if (charge.status !== 'succeeded') {
        throw new BadRequestException({
          message: ERROR_MESSAGES.common.BAD_REQUEST
        });
      }

      const transaction = await this.findTransactionByChargeOrPaymentIntent(chargeId, charge.payment_intent as string);
      if (!transaction) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.common.NOT_FOUND
        });
      }

      await this.updateTransactionStatus(transaction._id, {
        stripeChargeId: chargeId,
        status: TransactionStatus.USDC_TRANSFERRING,
        processedAt: new Date()
      });

      const userWalletAddress = transaction.destinationAddress;
      if (!userWalletAddress) {
        await this.handleTransferFailure(transaction._id, 'User wallet address not found in transaction');
        return this.createFailureResponse(chargeId, charge.payment_intent as string, charge.amount / 100, 'User wallet address not found in transaction');
      }

      try {
        // const transferResult = await this.createUSDCTransfer(transaction, charge.amount / 100);
        return this.handleTransferResult(
          {
            status: 'peding'
          },
          chargeId,
          charge.payment_intent as string,
          charge.amount / 100
        );
      } catch (transferError) {
        await this.handleTransferFailure(transaction._id, transferError.message);
        return this.createFailureResponse(chargeId, charge.payment_intent as string, charge.amount / 100, 'USDC transfer creation failed');
      }
    } catch (error) {
      console.log({ error: error.response.data });
      this.logger.error('Error handling payment success:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async handleWebhookEvent(event: any): Promise<IResponseData> {
    try {
      const eventHandlers = {
        'checkout.session.completed': () => this.handleCheckoutCompleted(event.data.object),
        'charge.succeeded': () => this.handlePaymentSuccess(event.data.object.id),
        'charge.failed': () => this.handlePaymentFailed(event.data.object.payment_intent),
        'charge.refunded': () => this.handlePaymentRefunded(event.data.object.id),
        'payment_intent.canceled': () => this.handlePaymentCanceled(event.data.object.id),
        'checkout.session.expired': () => this.handleCheckoutExpired(event.data.object.id)
      };
      if (event.type === 'charge.updated') {
        return {
          message: ERROR_MESSAGES.common.SUCCESSFUL,
          data: {
            event: event.type,
            status: 'unhandled'
          }
        };
      }
      const handler = eventHandlers[event.type];
      if (handler) {
        return await handler();
      }

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          event: event.type,
          status: 'unhandled'
        }
      };
    } catch (error) {
      this.logger.error('Error handling webhook event:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  private async handleCheckoutCompleted(session: any): Promise<IResponseData> {
    try {
      const transaction = await this.transactionModel.findOne({ stripeSessionId: session.id });
      if (!session.payment_intent || !transaction) {
        return this.createBasicCheckoutResponse(session.id);
      }

      const paymentIntent = await this.stripeService.getPaymentIntent(session.payment_intent);
      await this.updateTransactionPaymentInfo(transaction._id, paymentIntent);

      const userWalletAddress = transaction.destinationAddress;
      if (!userWalletAddress) {
        await this.handleTransferFailure(transaction._id, 'User wallet address not found in transaction');
        return this.createCheckoutFailureResponse(
          session.id,
          paymentIntent.id,
          paymentIntent.latest_charge as string,
          'User wallet address not found in transaction'
        );
      }

      try {
        const transferResult = await this.createUSDCTransfer(transaction, paymentIntent.amount / 100);
        return this.handleCheckoutTransferResult(transferResult, session.id, paymentIntent.id, paymentIntent.latest_charge as string);
      } catch (transferError) {
        await this.handleTransferFailure(transaction._id, transferError.message);
        return this.createCheckoutFailureResponse(session.id, paymentIntent.id, paymentIntent.latest_charge as string, 'USDC transfer creation failed');
      }
    } catch (error) {
      this.logger.error('Error handling checkout completed:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getPaymentStatus(paymentId: string): Promise<IResponseData> {
    try {
      const transaction = await this.findTransactionByIdentifier(paymentId);
      if (!transaction) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.common.NOT_FOUND
        });
      }

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: this.mapTransactionToResponse(transaction)
      };
    } catch (error) {
      this.logger.error('Error getting payment status:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getUserTransactions(userId: string, page = 1, limit = 10): Promise<IResponseData> {
    try {
      const filter = { userId: new Types.ObjectId(userId) };
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        this.transactionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
        this.transactionModel.countDocuments(filter)
      ]);

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          transactions: transactions.map(this.mapTransactionToResponse),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error('Error getting user transactions:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  @Cron('*/5 * * * * *')
  async updateTransferTransaction(): Promise<void> {
    try {
      const pendingTransactions = await this.transactionModel.find({
        status: TransactionStatus.USDC_TRANSFERRING,
        circleTransferStatus: 'pending'
      });

      if (pendingTransactions.length > 0) {
        this.logger.log(`Checking status for ${pendingTransactions.length} pending transactions`);
        const promises = pendingTransactions.map((transaction) => this.monitorTransferStatus(transaction.circleTransferId));
        await Promise.all(promises);
      }
    } catch (error) {
      this.logger.error('Error in updateTransferTransaction cron job:', error);
    }
  }

  async monitorTransferStatus(transferId: string): Promise<void> {
    try {
      const transferResult = await this.circleService.getTransferStatus(transferId);
      const transaction = await this.transactionModel.findOne({ circleTransferId: transferId });

      if (!transaction) {
        this.logger.warn(`Transaction not found for transfer ID: ${transferId}`);
        return;
      }

      if (transferResult.status === 'complete' && transferResult.transactionHash) {
        await this.updateTransactionStatus(transaction._id, {
          status: TransactionStatus.USDC_TRANSFERRED,
          circleTransactionHash: transferResult.transactionHash,
          completedAt: new Date()
        });
        this.logger.log(`Transfer ${transferId} completed successfully`);
      } else if (transferResult.status === 'failed') {
        await this.updateTransactionStatus(transaction._id, {
          status: TransactionStatus.USDC_TRANSFER_FAILED,
          circleTransferError: transferResult.error || 'Transfer failed'
        });
        this.logger.error(`Transfer ${transferId} failed: ${transferResult.error}`);
      }
    } catch (error) {
      this.logger.error(`Error monitoring transfer status for ${transferId}:`, error);
    }
  }

  // Private helper methods
  private async findTransactionByChargeOrPaymentIntent(chargeId: string, paymentIntentId: string): Promise<TransactionDocument | null> {
    return this.transactionModel.findOne({
      $or: [{ stripeChargeId: chargeId }, { stripePaymentIntentId: paymentIntentId }]
    });
  }

  private async findTransactionByIdentifier(identifier: string): Promise<TransactionDocument | null> {
    const queries = [{ stripeSessionId: identifier }, { stripePaymentIntentId: identifier }, { stripeChargeId: identifier }];

    for (const query of queries) {
      const transaction = await this.transactionModel.findOne(query);
      if (transaction) return transaction;
    }
    return null;
  }

  private async updateTransactionStatus(transactionId: Types.ObjectId, updates: any): Promise<void> {
    await this.transactionModel.findByIdAndUpdate(transactionId, updates);
  }

  private async updateTransactionPaymentInfo(transactionId: Types.ObjectId, paymentIntent: any): Promise<void> {
    await this.updateTransactionStatus(transactionId, {
      stripePaymentIntentId: paymentIntent.id,
      status: TransactionStatus.USDC_TRANSFERRING
    });

    if (paymentIntent.latest_charge) {
      const charge = await this.stripeService.getCharge(paymentIntent.latest_charge as string);
      await this.updateTransactionStatus(transactionId, { stripeChargeId: charge.id as string });
    }
  }

  private async createUSDCTransfer(transaction: TransactionDocument, amount: number): Promise<any> {
    return this.circleService.createTransfer({
      amount,
      destinationAddress: transaction.destinationAddress,
      userId: transaction.userId.toString(),
      transactionId: transaction._id.toString()
    });
  }

  private async handleTransferFailure(transactionId: Types.ObjectId, errorMessage: string): Promise<void> {
    await this.updateTransactionStatus(transactionId, {
      status: TransactionStatus.USDC_TRANSFER_FAILED,
      circleTransferError: errorMessage
    });
  }

  private handleTransferResult(transferResult: any, chargeId: string, paymentIntentId: string, amount: number): IResponseData {
    if (transferResult.status === 'pending' || transferResult.status === 'complete') {
      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          chargeId,
          paymentIntentId,
          amount,
          status: PaymentStatus.PROCESSING,
          transferId: transferResult.id,
          transferStatus: transferResult.status
        }
      };
    }

    return this.createFailureResponse(chargeId, paymentIntentId, amount, 'USDC transfer failed');
  }

  private handleCheckoutTransferResult(transferResult: any, sessionId: string, paymentIntentId: string, chargeId: string): IResponseData {
    switch (transferResult.status) {
      case 'pending':
        return this.createCheckoutSuccessResponse(sessionId, paymentIntentId, chargeId, transferResult, PaymentStatus.PROCESSING);
      case 'complete':
        return this.createCheckoutSuccessResponse(sessionId, paymentIntentId, chargeId, transferResult, PaymentStatus.COMPLETED);
      default:
        return this.createCheckoutFailureResponse(sessionId, paymentIntentId, chargeId, 'USDC transfer failed');
    }
  }

  private createFailureResponse(chargeId: string, paymentIntentId: string, amount: number, error: string): IResponseData {
    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: {
        chargeId,
        paymentIntentId,
        amount,
        status: PaymentStatus.FAILED,
        error
      }
    };
  }

  private createCheckoutSuccessResponse(
    sessionId: string,
    paymentIntentId: string,
    chargeId: string,
    transferResult: any,
    status: PaymentStatus
  ): IResponseData {
    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: {
        event: 'checkout.session.completed',
        sessionId,
        paymentIntentId,
        chargeId,
        transferId: transferResult.id,
        transferStatus: transferResult.status,
        status
      }
    };
  }

  private createCheckoutFailureResponse(sessionId: string, paymentIntentId: string, chargeId: string, error: string): IResponseData {
    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: {
        event: 'checkout.session.completed',
        sessionId,
        paymentIntentId,
        chargeId,
        status: PaymentStatus.FAILED,
        error
      }
    };
  }

  private createBasicCheckoutResponse(sessionId: string): IResponseData {
    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: {
        event: 'checkout.session.completed',
        sessionId,
        status: 'completed'
      }
    };
  }

  private mapTransactionToResponse(transaction: TransactionDocument): any {
    return {
      id: transaction._id,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      usdcAmount: transaction.usdcAmount,
      stripeSessionId: transaction.stripeSessionId,
      stripePaymentIntentId: transaction.stripePaymentIntentId,
      stripeChargeId: transaction.stripeChargeId,
      circleTransferId: transaction.circleTransferId,
      circleTransferStatus: transaction.circleTransferStatus,
      circleTransactionHash: transaction.circleTransactionHash,
      destinationAddress: transaction.destinationAddress,
      failureReason: transaction.failureReason,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      completedAt: transaction.completedAt
    };
  }

  private async handlePaymentFailed(paymentIntentId: string): Promise<IResponseData> {
    try {
      await this.updateTransactionStatus({ stripePaymentIntentId: paymentIntentId } as any, {
        status: TransactionStatus.FAILED,
        failureReason: 'Payment failed',
        processedAt: new Date()
      });

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          event: 'charge.failed',
          status: 'payment_failed',
          paymentIntentId
        }
      };
    } catch (error) {
      this.logger.error('Error handling payment failed:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  private async handlePaymentRefunded(chargeId: string): Promise<IResponseData> {
    try {
      await this.updateTransactionStatus({ stripeChargeId: chargeId } as any, {
        status: TransactionStatus.REFUNDED,
        failureReason: 'Payment refunded',
        processedAt: new Date()
      });

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          event: 'charge.refunded',
          status: 'payment_refunded',
          chargeId
        }
      };
    } catch (error) {
      this.logger.error('Error handling payment refunded:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  private async handlePaymentCanceled(paymentIntentId: string): Promise<IResponseData> {
    try {
      await this.updateTransactionStatus({ stripePaymentIntentId: paymentIntentId } as any, {
        status: TransactionStatus.CANCELLED,
        failureReason: 'Payment intent canceled',
        processedAt: new Date()
      });

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          event: 'payment_intent.canceled',
          status: 'payment_intent_canceled',
          paymentIntentId
        }
      };
    } catch (error) {
      this.logger.error('Error handling payment canceled:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  private async handleCheckoutExpired(sessionId: string): Promise<IResponseData> {
    try {
      await this.updateTransactionStatus({ stripeSessionId: sessionId } as any, {
        status: TransactionStatus.CANCELLED,
        failureReason: 'Checkout session expired',
        processedAt: new Date()
      });

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          event: 'checkout.session.expired',
          status: 'checkout_expired',
          sessionId
        }
      };
    } catch (error) {
      this.logger.error('Error handling checkout expired:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  private async getUserWalletAddress(userId: Types.ObjectId): Promise<string | null> {
    try {
      const walletResult = await this.walletService.getMyWallet({ _id: userId } as any);
      if (walletResult.data?.wallet?.address) {
        return walletResult.data.wallet.address;
      }

      this.logger.warn(`No wallet address found for user: ${userId}`);
      return null;
    } catch (error) {
      this.logger.error('Error getting user wallet address:', error);
      return null;
    }
  }
}
