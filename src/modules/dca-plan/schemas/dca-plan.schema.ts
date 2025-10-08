import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DCAPlanDocument = DCAPlan & Document;

export enum DCAPlanStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  PAUSE = 'pause',
  PAUSING = 'pausing',
  RESUME = 'resume',
  RESUMING = 'resuming'
}

export enum DCAPlanType {
  SELL = 'sell',
  BUY = 'buy'
}

@Schema({ timestamps: true })
export class DCAPlan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  tokenIn: string;

  @Prop({ required: true })
  tokenOut: string;

  @Prop({ required: true })
  unitPerTrade: string;

  @Prop({ required: true })
  frequency: string;

  @Prop({ required: true })
  total_trades: number;

  @Prop({ enum: DCAPlanStatus, default: DCAPlanStatus.PENDING })
  status: DCAPlanStatus;

  @Prop({ required: false })
  systemFee?: string;

  @Prop({ required: false })
  planGasFee?: string;

  @Prop({ required: false })
  startTime?: Date;

  @Prop({ required: false })
  planEndTime?: Date;

  @Prop({ enum: DCAPlanType, default: DCAPlanType.BUY })
  dcaType?: DCAPlanType;

  @Prop({ required: false })
  pausedAt?: Date;

  @Prop({ required: false })
  resumeAt?: Date;

  @Prop({ required: false })
  contractPlanId?: string;

  @Prop({ required: false })
  txhash?: string;

  @Prop({ required: false })
  txfee?: string;
}

export const DCAPlanSchema = SchemaFactory.createForClass(DCAPlan);

// Indexes
DCAPlanSchema.index({ user: 1 });
DCAPlanSchema.index({ status: 1 });
DCAPlanSchema.index({ tokenIn: 1 });
DCAPlanSchema.index({ tokenOut: 1 });
DCAPlanSchema.index({ contractPlanId: 1 });
DCAPlanSchema.index({ txhash: 1 });
