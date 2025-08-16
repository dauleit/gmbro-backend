import { Types } from 'mongoose';
import { TransactionStatus, TransactionType } from '../schemas/transaction.schema';

export interface ITransaction {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;

  // Stripe related fields
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;

  // Circle related fields
  circleTransferId?: string;
  circleChallengeId?: string;
  circleTransactionHash?: string;

  // Wallet information
  destinationAddress?: string;
  sourceAddress?: string;
  network?: string;

  // Metadata
  metadata?: Record<string, any>;
  failureReason?: string;

  // Timestamps
  completedAt?: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
