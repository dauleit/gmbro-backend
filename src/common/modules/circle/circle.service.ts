import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';
import { ConfigService } from 'src/configs/config.service';
import { CIRCLE_API_ENDPOINTS } from 'src/common/constants';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';
import { v4 as uuidv4 } from 'uuid';
import * as openpgp from 'openpgp';
import { Injectable, Logger } from '@nestjs/common';

const configService = new ConfigService();
export const circleUserSdk = initiateUserControlledWalletsClient({
  apiKey: configService.get('CIRCLE_API_KEY'),
  baseUrl: configService.get('CIRCLE_API_BASE_URL'),
  userAgent: configService.get('CIRCLE_USER_AGENT')
});

// Circle Service Class for DI
@Injectable()
export class CircleService {
  private readonly logger = new Logger(CircleService.name);

  constructor(private readonly configService: ConfigService) {}

  // Function to get public encryption key from Circle
  async getCircleEncryptionKey() {
    try {
      const response = await fetch(`${this.configService.get('CIRCLE_API_URL')}${CIRCLE_API_ENDPOINTS.ENCRYPTION_KEY}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.configService.get('CIRCLE_SANDBOX_API_KEY')}`,
          'Content-Type': 'application/json',
          'User-Agent': this.configService.get('CIRCLE_USER_AGENT')
        }
      });

      if (!response.ok) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.common.BAD_REQUEST
        });
      }

      return await response.json();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
  }

  // Function to create card on Circle
  async createCircleCard(cardData: any, userId: string) {
    try {
      const idempotencyKey = uuidv4();

      const payload = {
        idempotencyKey,
        keyId: cardData.keyId,
        encryptedData: cardData.encryptedCardData,
        expMonth: cardData.expMonth,
        expYear: cardData.expYear,
        billingDetails: cardData.billingDetails,
        metadata: {
          ...cardData.metadata,
          userId: userId,
          sessionId: cardData.metadata.sessionId || `session-${Date.now()}`,
          ipAddress: cardData.metadata.ipAddress || '127.0.0.1'
        }
      };

      const response = await fetch(`${this.configService.get('CIRCLE_API_URL')}${CIRCLE_API_ENDPOINTS.CARDS}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.configService.get('CIRCLE_SANDBOX_API_KEY')}`,
          'Content-Type': 'application/json',
          'User-Agent': this.configService.get('CIRCLE_USER_AGENT')
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.common.BAD_REQUEST
        });
      }

      return await response.json();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
  }

  async encryptCardInfo(cardInfo: any, encodedKey: string): Promise<string> {
    const armoredKey = Buffer.from(encodedKey, 'base64').toString('utf8');
    const publicKey = await openpgp.readKey({ armoredKey });

    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: JSON.stringify(cardInfo) }),
      encryptionKeys: publicKey
    });

    return Buffer.from(encrypted).toString('base64');
  }

  /**
   * Get user token from Circle based on userId
   * @param userId - The user ID to create token for
   * @returns Promise<string> - The user token
   */
  async getUserToken(userId: string): Promise<string> {
    try {
      const token = await circleUserSdk.createUserToken({ userId });

      return token.data.userToken;
    } catch (error) {
      this.logger.error(`Failed to create user token for userId: ${userId}`, error);
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
  }

  /**
   * Get wallet token balance from Circle
   * @param userToken - The user token for authentication
   * @param walletId - The wallet ID to get balance for
   * @returns Promise<any> - The wallet token balance data
   */
  async getWalletTokenBalance(userToken: string, walletId: string): Promise<any> {
    try {
      const walletTokenBalance = await circleUserSdk.getWalletTokenBalance({
        userToken: userToken,
        walletId: walletId
      });

      return walletTokenBalance.data;
    } catch (error) {
      this.logger.error(`Failed to get wallet token balance for walletId: ${walletId}`, error);
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
  }

  /**
   * Estimate transfer fee from Circle
   * @param userToken - The user token for authentication
   * @param destinationAddress - The destination address for the transfer
   * @param amount - The amount to transfer
   * @param tokenId - The token ID to transfer (optional, defaults to USDC)
   * @param blockchain - The blockchain for the transfer (optional, defaults to ETH-SEPOLIA)
   * @returns Promise<any> - The estimated transfer fee data
   */
  async estimateTransferFee(userToken: string, destinationAddress: string, amount: string, tokenId?: string, walletId?: string): Promise<any> {
    try {
      const transferFeeEstimate = await circleUserSdk.estimateTransferFee({
        userToken: userToken,
        destinationAddress: destinationAddress,
        amount: [amount],
        tokenId: tokenId,
        walletId: walletId
      });

      return transferFeeEstimate.data;
    } catch (error) {
      this.logger.error(`Failed to estimate transfer fee for destination: ${destinationAddress}`, error);
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
  }

  /**
   * Create transaction from Circle
   * @param userToken - The user token for authentication
   * @param walletId - The wallet ID to create transaction from
   * @param destinationAddress - The destination address for the transaction
   * @param amount - The amount to transfer
   * @param tokenId - The token ID to transfer (optional, defaults to USDC)
   * @returns Promise<any> - The created transaction data
   */
  async createTransaction(userToken: string, walletId: string, destinationAddress: string, amount: string, tokenId?: string, fee?: any): Promise<any> {
    try {
      const transaction = await circleUserSdk.createTransaction({
        userToken: userToken,
        walletId: walletId,
        destinationAddress: destinationAddress,
        amounts: [amount],
        tokenId: tokenId || 'USDC',
        fee: fee || {
          type: 'level',
          config: {
            feeLevel: 'MEDIUM'
          }
        }
      });

      return transaction.data;
    } catch (error) {
      this.logger.error(`Failed to create transaction for walletId: ${walletId}`, error);
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
  }

  /**
   * Create user transaction contract execution challenge
   * @param params - Contract execution parameters
   * @returns Promise<any> - Challenge response
   */
  async createUserTransactionContractExecutionChallenge(params: any): Promise<any> {
    try {
      const challenge = await circleUserSdk.createUserTransactionContractExecutionChallenge(params);

      return challenge.data;
    } catch (error) {
      this.logger.error(`Failed to create contract execution challenge:`, error);
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
  }

  /**
   * Get wallet balance from Circle
   * Using the EXACT same logic as getMyWallet in wallet.service.ts
   */
  async getWalletBalance(userId: string, walletId: string): Promise<number> {
    try {
      const userToken = await this.getUserToken(userId);

      const walletTokenBalance = await this.getWalletTokenBalance(userToken, walletId);

      const usdcBalance = walletTokenBalance.tokenBalances.find((token) => token.token.symbol === 'USDC')?.amount;

      if (usdcBalance) {
        return parseFloat(usdcBalance);
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  async getCardDetail(cardId: string) {
    const response = await fetch(`${this.configService.get('CIRCLE_API_URL')}${CIRCLE_API_ENDPOINTS.CARD_DETAIL}${cardId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.configService.get('CIRCLE_SANDBOX_API_KEY')}`
      }
    });
    if (!response.ok) {
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
    return await response.json();
  }
}
