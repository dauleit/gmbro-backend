import { Document, Types } from 'mongoose';
import { Wallet } from '../schemas/wallet.schema';
import { IUser } from 'src/modules/user/interfaces/user.interface';

export type IWallet = Wallet & Document;
