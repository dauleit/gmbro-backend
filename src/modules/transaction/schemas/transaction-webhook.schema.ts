import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

mongoose.set('debug', false);

export type TransactionWebhookDocument = TransactionWebhook & Document;

@Schema({ timestamps: true })
export class TransactionWebhook {
  @Prop({ required: true })
  subscriptionId: string;

  @Prop({ required: true })
  notificationId: string;

  @Prop({ required: true })
  notificationType: string;

  @Prop({ type: Object, required: true })
  notification: {
    id: string;
    blockchain: string;
    walletId: string;
    tokenId: string;
    userId: string;
    sourceAddress?: string;
    destinationAddress: string;
    amounts: string[];
    nftTokenIds: string[];
    state: string;
    errorReason?: string;
    transactionType: string;
    txHash?: string;
    createDate: string;
    updateDate: string;
    errorDetails?: any;
    networkFee?: string;
  };

  @Prop({ required: true })
  timestamp: string;

  @Prop({ required: true })
  version: number;

  @Prop({ type: Object })
  headers?: Record<string, any>;

  @Prop({ type: Object })
  rawData?: Record<string, any>;

  @Prop({ required: false })
  processed?: boolean;

  @Prop({ required: false })
  processedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Transaction', required: false })
  relatedTransaction?: Types.ObjectId;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const TransactionWebhookSchema = SchemaFactory.createForClass(TransactionWebhook);

// Indexes
TransactionWebhookSchema.index({ subscriptionId: 1 });
TransactionWebhookSchema.index({ notificationId: 1 }, { unique: true });
TransactionWebhookSchema.index({ notificationType: 1 });
TransactionWebhookSchema.index({ 'notification.id': 1 });
TransactionWebhookSchema.index({ 'notification.walletId': 1 });
TransactionWebhookSchema.index({ 'notification.userId': 1 });
TransactionWebhookSchema.index({ 'notification.blockchain': 1 });
TransactionWebhookSchema.index({ 'notification.state': 1 });
TransactionWebhookSchema.index({ 'notification.transactionType': 1 });
TransactionWebhookSchema.index({ processed: 1 });
TransactionWebhookSchema.index({ createdAt: -1 });
TransactionWebhookSchema.index({ processedAt: -1 });
TransactionWebhookSchema.index({ relatedTransaction: 1 });
