import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DCAPlanRecordStatus } from '../enums/dca-plan-record-status.enum';

export type DCAPlanRecordDocument = DCAPlanRecord & Document;

@Schema({ timestamps: true })
export class DCAPlanRecord {
  @Prop({ type: Types.ObjectId, ref: 'DCAPlan', required: true })
  dcaPlan: Types.ObjectId;

  @Prop({ required: true })
  executionTime: Date;

  @Prop({ required: false })
  txHash?: string;

  @Prop({ required: false })
  amountIn?: string;

  @Prop({ required: false })
  amountOut?: string;

  @Prop({ required: false })
  gasUsed?: string;

  @Prop({ required: false })
  blockNumber?: number;

  @Prop({
    enum: Object.values(DCAPlanRecordStatus),
    default: DCAPlanRecordStatus.PENDING
  })
  status: DCAPlanRecordStatus;

  @Prop({ required: false })
  errorMessage?: string;

  @Prop({ required: false })
  completedAt?: Date;

  @Prop({ required: false })
  failedAt?: Date;
}

export const DCAPlanRecordSchema = SchemaFactory.createForClass(DCAPlanRecord);

// Indexes
DCAPlanRecordSchema.index({ dcaPlan: 1 });
DCAPlanRecordSchema.index({ executionTime: 1 });
DCAPlanRecordSchema.index({ status: 1 });
DCAPlanRecordSchema.index({ txHash: 1 });
DCAPlanRecordSchema.index({ dcaPlan: 1, executionTime: -1 });
