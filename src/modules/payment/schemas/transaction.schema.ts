import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  USDC_TRANSFERRING = 'usdc_transferring',
  USDC_TRANSFERRED = 'usdc_transferred',
  USDC_TRANSFER_FAILED = 'usdc_transfer_failed'
}

export enum TransactionType {
  USDC_DEPOSIT = 'usdc_deposit',
  USDC_WITHDRAWAL = 'usdc_withdrawal',
  TRANSFER = 'transfer'
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Prop({ required: true })
  amount: number; // Số tiền (cents)

  @Prop({ required: true, default: 'usd' })
  currency: string;

  // Stripe related fields
  @Prop()
  stripeSessionId?: string; // cs_xxx

  @Prop()
  stripePaymentIntentId?: string; // pi_xxx

  @Prop()
  stripeChargeId?: string; // ch_xxx

  // Circle related fields
  @Prop()
  circleTransferId?: string;

  @Prop()
  circleChallengeId?: string;

  @Prop()
  circleTransactionHash?: string;

  @Prop()
  circleTransferStatus?: string;

  @Prop()
  circleTransferError?: string;

  @Prop()
  usdcAmount?: number; // Amount in USDC (6 decimals)

  @Prop()
  usdcTransferFee?: number; // Transfer fee in USDC

  // Wallet information
  @Prop()
  destinationAddress?: string;

  @Prop()
  sourceAddress?: string;

  @Prop()
  network?: string; // 'ethereum', 'polygon', etc.

  // Metadata
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  failureReason?: string;

  @Prop()
  completedAt?: Date;

  @Prop()
  processedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes for better query performance
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ stripeSessionId: 1 });
TransactionSchema.index({ stripePaymentIntentId: 1 });
TransactionSchema.index({ circleTransferId: 1 });
TransactionSchema.index({ type: 1, status: 1 });
