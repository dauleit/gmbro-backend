import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

mongoose.set('debug', false);

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, unique: true })
  circleTransactionId: string; // Circle transaction ID

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Wallet', required: false })
  wallet?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment', required: false })
  payment?: Types.ObjectId;

  @Prop({ required: false })
  blockchain?: string;

  @Prop({ required: false })
  tokenId?: string;

  @Prop({ required: false })
  sourceAddress?: string;

  @Prop({ required: false })
  destinationAddress?: string;

  @Prop({ required: false })
  transactionType?: string;

  @Prop({ required: false })
  custodyType?: string;

  @Prop({ required: false })
  state?: string;

  @Prop({ type: String, required: false })
  amounts?: string;

  @Prop({ type: Object, required: false })
  nfts?: any;

  @Prop({ required: false })
  txHash?: string;

  @Prop({ required: false })
  blockHash?: string;

  @Prop({ required: false })
  blockHeight?: number;

  @Prop({ required: false })
  networkFee?: string;

  @Prop({ required: false })
  firstConfirmDate?: Date;

  @Prop({ required: false })
  operation?: string;

  @Prop({ required: false })
  userId?: string;

  @Prop({ type: Object, required: false })
  abiParameters?: any;

  @Prop({ required: false })
  createDate?: Date;

  @Prop({ required: false })
  updateDate?: Date;

  // Legacy fields (keep for backward compatibility)
  @Prop({ required: false })
  type?: string;

  @Prop({ required: false })
  status?: string;

  @Prop({ required: false })
  errorReason?: string;

  @Prop({ type: Object, required: false })
  errorDetails?: any;

  @Prop({ required: false })
  processFee?: string;

  @Prop({ required: false })
  totalAmount?: string;

  @Prop({ required: false })
  currency?: string;

  @Prop({ required: false })
  userOpHash?: string;

  @Prop({ required: false })
  refId?: string;

  @Prop({ type: [String], required: false })
  nftTokenIds?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Indexes
TransactionSchema.index({ circleTransactionId: 1 }, { unique: true });
TransactionSchema.index({ user: 1 });
TransactionSchema.index({ wallet: 1 });
TransactionSchema.index({ payment: 1 });
TransactionSchema.index({ refId: 1 });
TransactionSchema.index({ type: 1 });
