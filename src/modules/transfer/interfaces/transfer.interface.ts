export interface ITransfer {
  userId: string;
  walletId: string;
  destinationAddress: string;
  amount: string;
  tokenId?: string;
  status?: TransferStatus;
  transactionId?: string;
  circleTransactionId?: string;
  fee?: string;
  memo?: string;
  errorMessage?: string;
}

export enum TransferStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface ICreateTransferRequest {
  destinationAddress: string;
  amount: string;
  tokenId?: string;
  memo?: string;
}

export interface ITransferResponse {
  id: string;
  userId: string;
  walletId: string;
  destinationAddress: string;
  amount: string;
  tokenId: string;
  status: TransferStatus;
  transactionId?: string;
  circleTransactionId?: string;
  fee?: string;
  memo?: string;
  errorMessage?: string;
  completedAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeeConfig {
  feeLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface IFee {
  type: 'level';
  config: IFeeConfig;
}
