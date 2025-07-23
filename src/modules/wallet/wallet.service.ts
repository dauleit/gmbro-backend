import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
      const firstWallet = circleWallets.data.wallets[0];

      // Create wallet data to save in database
      const walletData = {
        state: firstWallet.state,
        walletSetId: firstWallet.walletSetId,
        custodyType: firstWallet.custodyType,
        user: user._id,
        address: firstWallet.address,
        blockchain: firstWallet.blockchain,
        accountType: (firstWallet as any).accountType,
        scaCore: (firstWallet as any).scaCore
      };

      // Save wallet to database
      const newWallet = new this.walletModel(walletData);
      const savedWallet = await newWallet.save();

      return {
        message: ERROR_MESSAGES.common.CREATED,
        data: { wallet: savedWallet }
      };
    } catch (error) {
      console.log(error);
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
      return { message: ERROR_MESSAGES.common.SUCCESSFUL, data: { wallet } };
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) {
        throw error;
      }
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
      console.log(error.response.data);
      throw new InternalServerErrorException({
        message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR
      });
    }
  }

  async findByUser(userId: string): Promise<IWallet | null> {
    try {
      return await this.walletModel.findOne({ user: userId }).populate('user', 'firstName lastName email').exec();
    } catch (error) {
      this.logger.error('Error finding wallet by user:', error);
      throw error;
    }
  }
}
