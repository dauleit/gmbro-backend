import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateCheckoutSessionDto {
  amount: number;
  currency: string;
  paymentMethodTypes: ('crypto' | 'card')[];
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-07-30.basil'
    });
  }

  async createCheckoutSession(createCheckoutDto: CreateCheckoutSessionDto) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: createCheckoutDto.paymentMethodTypes as any,
        line_items: [
          {
            price_data: {
              currency: createCheckoutDto.currency,
              product_data: {
                name: 'USDC Deposit',
                description: 'Deposit USDC to your wallet'
              },
              unit_amount: createCheckoutDto.amount
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: createCheckoutDto.successUrl,
        cancel_url: createCheckoutDto.cancelUrl,
        metadata: createCheckoutDto.metadata
      });

      return session;
    } catch (error) {
      this.logger.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async getPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  async getCheckoutSession(sessionId: string) {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      this.logger.error('Error retrieving checkout session:', error);
      throw error;
    }
  }

  async getCheckoutSessionWithPaymentIntent(sessionId: string) {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent']
      });
    } catch (error) {
      this.logger.error('Error retrieving checkout session with payment intent:', error);
      throw error;
    }
  }

  async getCharge(chargeId: string) {
    try {
      return await this.stripe.charges.retrieve(chargeId);
    } catch (error) {
      this.logger.error(`Error retrieving charge ${chargeId}:`, error);
      throw error;
    }
  }

  async constructWebhookEvent(payload: any, signature: string) {
    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
      }

      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Error constructing webhook event:', error);
      throw error;
    }
  }
}
