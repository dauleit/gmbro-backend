import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransferDocument = Transfer & Document;

export enum TransferStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

@Schema({ timestamps: true })
export class Transfer {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  walletId: string;

  @Prop({ required: true })
  destinationAddress: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ default: 'USDC' })
  tokenId: string;

  @Prop({ enum: TransferStatus, default: TransferStatus.PENDING })
  status: TransferStatus;

  @Prop()
  transactionId: string;

  @Prop()
  circleTransactionId: string;

  @Prop()
  fee: string;

  @Prop()
  memo: string;

  @Prop()
  errorMessage: string;

  @Prop()
  completedAt: Date;

  @Prop()
  failedAt: Date;
}

export const TransferSchema = SchemaFactory.createForClass(Transfer);

// Indexes for better query performance
TransferSchema.index({ userId: 1 });
TransferSchema.index({ walletId: 1 });
TransferSchema.index({ status: 1 });
TransferSchema.index({ createdAt: -1 });
TransferSchema.index({ userId: 1, status: 1 });
