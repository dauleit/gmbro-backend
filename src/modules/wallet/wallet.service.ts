import { Circle, CircleEnvironments } from '@circle-fin/circle-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ObjectId } from 'mongoose';
import { ConfigService } from 'src/configs/config.service';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { IWallet } from './interfaces/wallet.interface';
import { UserService } from '../user/user.service';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';
import { IUser } from '../user/interfaces/user.interface';
import { IResponseData } from 'src/base/base-controller';
import { circleUserSdk } from 'src/common/modules/circle/circle.service';
import { circleAccountType, circleBlockchain } from 'src/common/modules/circle/circle.enum';
import { InternalServerErrorException } from 'src/common/exceptions/internal-server-error.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';

// Interface for Circle wallet response
interface ICircleWallet {
  id: string;
  address: string;
  state: string;
  walletSetId: string;
  custodyType: string;
  blockchain: string;
  accountType?: string;
  scaCore?: string;
  balances?: Array<{
    currency: string;
    amount: string;
  }>;
  description?: string;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<WalletDocument>,
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {}

  async createWallet(user: IUser): Promise<IResponseData> {
    try {
      // Check if user already has a wallet in database
      const existingWallet = await this.walletModel.findOne({ user: user._id });
      if (existingWallet) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.wallet.WALLET_IS_EXISTED
        });
      }

      // Get wallets from Circle using circleUserSDK
      const userData = await this.userService.findOneById(user._id);
      const circleWallets = await circleUserSdk.listWallets({ userId: userData.circleUserId });

      // Check if wallets array is empty
      if (!circleWallets.data || !circleWallets.data.wallets || circleWallets.data.wallets.length === 0) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.wallet.WALLET_IS_NOT_CREATED
        });
      }

      // Get the first wallet from the array
      const firstWallet = circleWallets.data.wallets[0] as ICircleWallet;

      // Create wallet data to save in database
      const walletData = {
        state: firstWallet.state,
        walletSetId: firstWallet.walletSetId,
        custodyType: firstWallet.custodyType,
        user: user._id,
        address: firstWallet.address,
        blockchain: firstWallet.blockchain,
        accountType: firstWallet.accountType || '',
        scaCore: firstWallet.scaCore || ''
      };

      // Save wallet to database
      const newWallet = new this.walletModel(walletData);
      const savedWallet = await newWallet.save();

      return {
        message: ERROR_MESSAGES.common.CREATED,
        data: { wallet: savedWallet }
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.wallet.CREATE_WALLET_FAILED
      });
    }
  }

  async getMyWallet(user: IUser): Promise<IResponseData> {
    try {
      const wallet = await this.walletModel.findOne({ user: user._id });

      if (!wallet) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.wallet.WALLET_NOT_FOUND
        });
      }
      const token = await circleUserSdk.createUserToken({ userId: user.circleUserId });
      const walletTokenBalance = await circleUserSdk.getWalletTokenBalance({
        userToken: token.data.userToken,
        walletId: wallet.walletSetId
      });

      const walletWithBalance = {
        ...wallet.toJSON(),
        balance: walletTokenBalance.data.tokenBalances.find((token) => token.token.symbol === 'USDC')?.amount
      };
      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: { wallet: walletWithBalance }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.log(error);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async requestCreateWallet(user: IUser): Promise<IResponseData> {
    try {
      const userData = await this.userService.findOneById(user.id);
      const circleUser = await circleUserSdk.createUserPinWithWallets({
        userToken: userData.circleUserToken,
        blockchains: [circleBlockchain.ethSepolia],
        accountType: circleAccountType.sca
      });

      const data = {
        challengeId: circleUser.data.challengeId,
        userToken: userData.circleUserToken,
        encryptionKey: userData.circleUserEncryptionKey
      };
      return { message: ERROR_MESSAGES.common.SUCCESSFUL, data };
    } catch (error) {
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async findByUser(userId: string): Promise<IWallet | null> {
    try {
      return await this.walletModel
        .findOne({ user: new Types.ObjectId(userId) })
        .populate('user', 'firstName lastName email')
        .exec();
    } catch (error) {
      this.logger.error('Error finding wallet by user:', error);
      throw error;
    }
  }

  /**
   * Helper method to get Circle wallet data by walletSetId
   */
  private async getCircleWalletData(circleUserId: string, walletSetId: string): Promise<ICircleWallet | null> {
    try {
      const circleWallets = await circleUserSdk.listWallets({
        userId: circleUserId
      });
      console.log(circleWallets.data);
      if (circleWallets.data && circleWallets.data.wallets && circleWallets.data.wallets.length > 0) {
        return circleWallets.data.wallets[0] as ICircleWallet;
      }

      return null;
    } catch (error) {
      console.log(error);
      this.logger.warn('Failed to fetch Circle wallet data:', error);
      return null;
    }
  }

  /**
   * Get wallet balance for specific currency
   */
  async getWalletBalanceByCurrency(user: IUser, currency: string): Promise<IResponseData> {
    try {
      const wallet = await this.walletModel.findOne({ user: user._id });
      if (!wallet) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.wallet.WALLET_NOT_FOUND
        });
      }

      const userData = await this.userService.findOneById(user._id);
      const circleWallet = await this.getCircleWalletData(userData.circleUserId, wallet.walletSetId);

      if (circleWallet && circleWallet.balances) {
        const currencyBalance = circleWallet.balances.find((balance) => balance.currency === currency);

        if (currencyBalance) {
          return {
            message: ERROR_MESSAGES.common.SUCCESSFUL,
            data: {
              currency: currencyBalance.currency,
              amount: currencyBalance.amount,
              lastUpdated: new Date()
            }
          };
        } else {
          return {
            message: ERROR_MESSAGES.common.SUCCESSFUL,
            data: {
              currency,
              amount: '0',
              lastUpdated: new Date()
            }
          };
        }
      }

      throw new NotFoundException({
        message: ERROR_MESSAGES.wallet.WALLET_NOT_FOUND_IN_CIRCLE
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.wallet.GET_BALANCE_FAILED
      });
    }
  }

  /**
   * Get wallet transaction history from Circle
   */
  async getWalletTransactions(user: IUser, limit = 50): Promise<IResponseData> {
    try {
      const wallet = await this.walletModel.findOne({ user: user._id });
      if (!wallet) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.wallet.WALLET_NOT_FOUND
        });
      }

      const userData = await this.userService.findOneById(user._id);

      // Get transactions from Circle (this would depend on Circle SDK capabilities)
      // For now, we'll return a placeholder response
      const transactions = {
        walletAddress: wallet.address,
        totalCount: 0,
        transactions: [],
        lastUpdated: new Date()
      };

      return {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: { transactions }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.wallet.GET_TRANSACTIONS_FAILED
      });
    }
  }

  /**
   * Get detailed wallet information from Circle
   */
  async getWalletDetails(user: IUser): Promise<IResponseData> {
    try {
      const wallet = await this.walletModel.findOne({ user: user._id });
      if (!wallet) {
        throw new NotFoundException({
          message: ERROR_MESSAGES.wallet.WALLET_NOT_FOUND
        });
      }

      const userData = await this.userService.findOneById(user._id);
      const circleWallet = await this.getCircleWalletData(userData.circleUserId, wallet.walletSetId);

      if (circleWallet) {
        const walletDetails = {
          ...wallet.toObject(),
          circleDetails: {
            id: circleWallet.id,
            walletSetId: circleWallet.walletSetId,
            custodyType: circleWallet.custodyType,
            state: circleWallet.state,
            balances: circleWallet.balances || [],
            description: circleWallet.description || '',
            lastUpdated: new Date()
          }
        };

        return {
          message: ERROR_MESSAGES.common.SUCCESSFUL,
          data: { wallet: walletDetails }
        };
      }

      throw new NotFoundException({
        message: ERROR_MESSAGES.wallet.WALLET_NOT_FOUND_IN_CIRCLE
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.wallet.GET_WALLET_DETAILS_FAILED
      });
    }
  }
}
