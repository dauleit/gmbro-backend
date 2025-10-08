import { Types } from 'mongoose';
import { IUser } from 'src/modules/user/interfaces/user.interface';
import { IWallet } from 'src/modules/wallet/interfaces/wallet.interface';

export interface ITransaction {
  _id?: Types.ObjectId;
  circleTransactionId?: string;
  user?: Types.ObjectId | IUser | string;
  wallet?: Types.ObjectId | IWallet | string;
  payment?: Types.ObjectId | string;
  blockchain?: string;
  tokenId?: string;
  walletId?: string;
  sourceAddress?: string;
  destinationAddress?: string;
  transactionType?: string;
  custodyType?: string;
  state?: string;
  amounts?: string[];
  nfts?: any;
  txHash?: string;
  blockHash?: string;
  blockHeight?: number;
  networkFee?: string;
  firstConfirmDate?: Date;
  operation?: string;
  userId?: string;
  abiParameters?: any;
  createDate?: Date;
  updateDate?: Date;

  // Legacy fields
  type?: string;
  status?: string;
  errorReason?: string;
  errorDetails?: any;
  processFee?: string;
  totalAmount?: string;
  currency?: string;
  nftTokenIds?: string[];

  userOpHash?: string;
  refId?: string;

  createdBy?: Types.ObjectId | IUser | string;
  updatedBy?: Types.ObjectId | IUser | string;
}
