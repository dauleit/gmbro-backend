import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StripeService } from './stripe.service';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus } from './schemas/transaction.schema';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { IResponseData } from '../../base/base-controller';
import { ERROR_MESSAGES } from '../../common/constants/errorMessage';
import { InternalServerErrorException } from '../../common/exceptions/internal-server-error.exception';
import { BadRequestException } from '../../common/exceptions/bad-request.exception';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly stripeService: StripeService, @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>) {}

  async createCheckoutSession(createCheckoutDto: CreateCheckoutDto, userId: string): Promise<IResponseData> {
    try {
      const checkoutSession = await this.stripeService.createCheckoutSession({
        amount: createCheckoutDto.amount,
        currency: 'usd',
        paymentMethodTypes: ['crypto', 'card'],
        metadata: {
          userId,
          type: 'usdc_deposit',
          amount: createCheckoutDto.amount.toString(),
          timestamp: Date.now().toString()
        },
        successUrl: `${createCheckoutDto.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: createCheckoutDto.cancelUrl
      });

      await this.transactionModel.create({
        userId,
        type: TransactionType.USDC_DEPOSIT,
        amount: createCheckoutDto.amount,
        currency: 'usd',
        stripeSessionId: checkoutSession.id
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
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async handlePaymentSuccess(chargeId: string): Promise<IResponseData> {
    try {
      const charge = await this.stripeService.getCharge(chargeId);

      if (charge.status === 'succeeded') {
        const transaction = await this.transactionModel.findOne({
          $or: [{ stripeChargeId: chargeId }, { stripePaymentIntentId: charge.payment_intent }]
        });

        if (transaction) {
          await this.transactionModel.findByIdAndUpdate(transaction._id, {
            stripeChargeId: chargeId,
            status: TransactionStatus.PROCESSING,
            processedAt: new Date()
          });
        }

        return {
          message: ERROR_MESSAGES.common.SUCCESSFUL,
          data: {
            chargeId: chargeId,
            paymentIntentId: charge.payment_intent,
            amount: charge.amount,
            status: PaymentStatus.PROCESSING
          }
        };
      }

      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    } catch (error) {
      this.logger.error('Error handling payment success:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async handleWebhookEvent(event: any): Promise<IResponseData> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          return this.handleCheckoutCompleted(event.data.object);

        case 'charge.succeeded':
          return this.handlePaymentSuccess(event.data.object.id);

        case 'charge.failed':
          return this.handlePaymentFailed(event.data.object.payment_intent);

        case 'charge.refunded':
          return this.handlePaymentRefunded(event.data.object.id);

        case 'payment_intent.canceled':
          return this.handlePaymentCanceled(event.data.object.id);

        case 'checkout.session.expired':
          return this.handleCheckoutExpired(event.data.object.id);

        default:
          return {
            message: ERROR_MESSAGES.common.SUCCESSFUL,
            data: {
              event: event.type,
              status: 'unhandled'
            }
          };
      }
    } catch (error) {
      this.logger.error('Error handling webhook event:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  private async handleCheckoutCompleted(session: any): Promise<IResponseData> {
    try {
      const transaction = await this.transactionModel.findOne({
        stripeSessionId: session.id
      });

      if (session.payment_intent && transaction) {
        const paymentIntent = await this.stripeService.getPaymentIntent(session.payment_intent);

        await this.transactionModel.findByIdAndUpdate(transaction._id, {
          stripePaymentIntentId: paymentIntent.id,
          status: TransactionStatus.PROCESSING
        });

        if (paymentIntent.latest_charge) {
          const charge = await this.stripeService.getCharge(paymentIntent.latest_charge as string);
          await this.transactionModel.findByIdAndUpdate(transaction._id, {
            stripeChargeId: charge.id
          });
        }

        return {
          message: ERROR_MESSAGES.common.SUCCESSFUL,
          data: {
            event: 'checkout.session.completed',
            sessionId: session.id,
            paymentIntentId: paymentIntent.id,
            chargeId: paymentIntent.latest_charge,
            status: PaymentStatus.PROCESSING
          }
        };
      }

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          event: 'checkout.session.completed',
          sessionId: session.id,
          status: 'completed'
        }
      };
    } catch (error) {
      this.logger.error('Error handling checkout completed:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async getPaymentStatus(paymentId: string): Promise<IResponseData> {
    try {
      if (paymentId.startsWith('cs_')) {
        const session = await this.stripeService.getCheckoutSessionWithPaymentIntent(paymentId);

        if (session.payment_intent) {
          const paymentIntent = session.payment_intent as any;
          return {
            message: ERROR_MESSAGES.common.SUCCESSFUL,
            data: {
              sessionId: session.id,
              paymentIntentId: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              createdAt: paymentIntent.created,
              sessionStatus: session.status
            }
          };
        }

        return {
          message: ERROR_MESSAGES.common.SUCCESSFUL,
          data: {
            sessionId: session.id,
            status: session.status,
            amount: session.amount_total,
            currency: session.currency,
            createdAt: session.created
          }
        };
      }

      const paymentIntent = await this.stripeService.getPaymentIntent(paymentId);
      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          paymentId,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          createdAt: paymentIntent.created
        }
      };
    } catch (error) {
      this.logger.error('Error getting payment status:', error);
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
          transactions: transactions.map((t) => ({
            id: t._id,
            type: t.type,
            status: t.status,
            amount: t.amount,
            currency: t.currency,
            stripeSessionId: t.stripeSessionId,
            stripePaymentIntentId: t.stripePaymentIntentId,
            circleTransferId: t.circleTransferId,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
          })),
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

  private async handlePaymentFailed(paymentIntentId: string): Promise<IResponseData> {
    try {
      await this.transactionModel.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        {
          status: TransactionStatus.FAILED,
          failureReason: 'Payment failed',
          processedAt: new Date()
        }
      );

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          event: 'charge.failed',
          status: 'payment_failed',
          paymentIntentId: paymentIntentId
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
      await this.transactionModel.findOneAndUpdate(
        { stripeChargeId: chargeId },
        {
          status: TransactionStatus.REFUNDED,
          failureReason: 'Payment refunded',
          processedAt: new Date()
        }
      );

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          event: 'charge.refunded',
          status: 'payment_refunded',
          chargeId: chargeId
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
      await this.transactionModel.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        {
          status: TransactionStatus.CANCELLED,
          failureReason: 'Payment intent canceled',
          processedAt: new Date()
        }
      );

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          event: 'payment_intent.canceled',
          status: 'payment_intent_canceled',
          paymentIntentId: paymentIntentId
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
      await this.transactionModel.findOneAndUpdate(
        { stripeSessionId: sessionId },
        {
          status: TransactionStatus.CANCELLED,
          failureReason: 'Checkout session expired',
          processedAt: new Date()
        }
      );

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: {
          event: 'checkout.session.expired',
          status: 'checkout_expired',
          sessionId: sessionId
        }
      };
    } catch (error) {
      this.logger.error('Error handling checkout expired:', error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }
}
