import { Types } from 'mongoose';
import { IDCAPlan } from './dca-plan.interface';
import { DCAPlanRecordStatus } from '../enums/dca-plan-record-status.enum';

export interface IDCAPlanRecord {
  _id?: Types.ObjectId;
  dcaPlan: Types.ObjectId | IDCAPlan | string;
  executionTime: Date;
  txHash?: string;
  amountIn?: string;
  amountOut?: string;
  gasUsed?: string;
  blockNumber?: number;
  status: DCAPlanRecordStatus;
  errorMessage?: string;
  completedAt?: Date;
  failedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDCAPlanRecordResponse {
  id: string;
  dcaPlan: string;
  executionTime: Date;
  txHash?: string;
  amountIn?: string;
  amountOut?: string;
  gasUsed?: string;
  blockNumber?: number;
  status: DCAPlanRecordStatus;
  errorMessage?: string;
  completedAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
