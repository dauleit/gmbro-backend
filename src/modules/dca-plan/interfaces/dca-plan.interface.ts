import { Types } from 'mongoose';
import { IUser } from 'src/modules/user/interfaces/user.interface';
import { DCAPlanType } from '../schemas/dca-plan.schema';

export enum DCAPlanStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  PAUSE = 'pause',
  PAUSING = 'pausing',
  RESUME = 'resume',
  RESUMING = 'resuming'
}

export interface IDCAPlan {
  _id?: Types.ObjectId;
  user: Types.ObjectId | IUser | string;
  tokenIn: string;
  tokenOut: string;
  unitPerTrade: string;
  frequency: string;
  total_trades: number;
  dcaType: DCAPlanType;
  status: DCAPlanStatus;
  systemFee?: string;
  planGasFee?: string;
  startTime?: Date;
  planEndTime?: Date;
  pausedAt?: Date;
  resumeAt?: Date;
  contractPlanId?: string;
  txhash?: string;
  txfee?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateDCAPlanRequest {
  tokenIn: string;
  tokenOut: string;
  unitPerTrade: string;
  frequency: string;
  total_trades: number;
  systemFee?: string;
  planGasFee?: string;
  startTime?: Date;
  planEndTime?: Date;
}

export interface IDCAPlanResponse {
  id: string;
  user: string;
  tokenIn: string;
  tokenOut: string;
  unitPerTrade: string;
  frequency: string;
  total_trades: number;
  dcaType: DCAPlanType;
  status: DCAPlanStatus;
  systemFee?: string;
  planGasFee?: string;
  startTime?: Date;
  planEndTime?: Date;
  pausedAt?: Date;
  resumeAt?: Date;
  contractPlanId?: string;
  txhash?: string;
  txfee?: string;
  createdAt: Date;
  updatedAt: Date;
}
