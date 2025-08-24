import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

mongoose.set('debug', false);

export type WalletDocument = Wallet & Document;
@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  walletSetId: string;

  @Prop({ required: true })
  custodyType: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  blockchain: string;

  @Prop({ required: true })
  accountType: string;

  @Prop({ required: true })
  scaCore: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

// Indexes
WalletSchema.index({ user: 1 });
WalletSchema.index({ address: 1 }, { unique: true });
WalletSchema.index({ walletSetId: 1 });
WalletSchema.index({ createdAt: -1 });
