import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { circleUserSdk } from 'src/common/modules/circle/circle.service';

@Injectable()
export class CircleService {
  private readonly httpClient: AxiosInstance;
  private readonly logger = new Logger(CircleService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('CIRCL_API_SANDBOX_KEY');

    if (!apiKey) {
      throw new Error('CIRCL_API_SANDBOX_KEY is not configured');
    }

    this.httpClient = axios.create({
      baseURL: 'https://api-sandbox.circle.com',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get wallet balance from Circle
   * Using the EXACT same logic as getMyWallet in wallet.service.ts
   */
  async getWalletBalance(userId: string, walletId: string): Promise<number> {
    try {
      this.logger.log(`Getting wallet balance for ${walletId} using Circle User SDK - same as getMyWallet`);

      // Apply the EXACT same logic as getMyWallet:
      // 1. Create user token
      const token = await circleUserSdk.createUserToken({ userId });

      // 2. Get wallet token balance using circleUserSdk
      const walletTokenBalance = await circleUserSdk.getWalletTokenBalance({
        userToken: token.data.userToken,
        walletId: walletId
      });

      // 3. Extract USDC balance from tokenBalances - EXACT same logic
      const usdcBalance = walletTokenBalance.data.tokenBalances.find((token) => token.token.symbol === 'USDC')?.amount;

      if (usdcBalance) {
        return parseFloat(usdcBalance);
      }

      // If no USDC balance found, return 0 (EXACT same as getMyWallet)
      this.logger.warn(`No USDC balance found for wallet ${walletId}`);
      return 0;
    } catch (error) {
      this.logger.error('Failed to get wallet balance using Circle User SDK:', error);

      // Return 0 instead of mock data (EXACT same as getMyWallet)
      return 0;
    }
  }

  // All smart contract related logic has been removed
  // CircleService now only handles wallet balance functionality
}
