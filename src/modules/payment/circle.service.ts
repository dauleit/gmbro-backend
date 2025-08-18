import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTransferDto {
  amount: number;
  destinationAddress: string;
  userId: string;
  transactionId: string;
}

export interface TransferResult {
  id: string;
  status: string;
  transactionHash?: string;
  error?: string;
}

export interface RecipientAddress {
  id: string;
  address: string;
  addressTag?: string;
  currency: string;
  chain: string;
  description?: string;
}

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

  async createTransfer(createTransferDto: CreateTransferDto): Promise<TransferResult> {
    try {
      this.logger.log(`Creating USDC transfer for transaction: ${createTransferDto.transactionId}`);

      // Step 1: Get or create recipient address
      const recipientAddress = await this.getOrCreateRecipientAddress(createTransferDto.destinationAddress);

      if (!recipientAddress) {
        throw new Error('Failed to get or create recipient address');
      }

      // Step 2: Create business account transfer with correct payload format
      const transferData = {
        idempotencyKey: uuidv4(),
        amount: {
          amount: createTransferDto.amount.toString(),
          currency: 'USD'
        },
        destination: {
          type: 'verified_blockchain',
          addressId: recipientAddress.id
        }
      };
      const response = await this.httpClient.post('/v1/businessAccount/transfers', transferData);
      return {
        id: response.data.data.id,
        status: response.data.data.status
      };
    } catch (error) {
      this.logger.error('Error creating USDC transfer:', error);
      return {
        id: '',
        status: 'failed',
        error: error.response?.data?.message || error.message
      };
    }
  }

  private async getOrCreateRecipientAddress(destinationAddress: string): Promise<RecipientAddress | null> {
    try {
      // Step 1: Try to get existing recipient address
      const existingAddress = await this.getRecipientAddress(destinationAddress);

      if (existingAddress) {
        this.logger.log(`Found existing recipient address: ${existingAddress.id}`);
        return existingAddress;
      }

      // Step 2: Create new recipient address if not exists
      this.logger.log(`Creating new recipient address for: ${destinationAddress}`);
      const newAddress = await this.createRecipientAddress(destinationAddress);

      if (newAddress) {
        this.logger.log(`Created new recipient address: ${newAddress.id}`);
        return newAddress;
      }

      return null;
    } catch (error) {
      this.logger.error('Error in getOrCreateRecipientAddress:', error);
      return null;
    }
  }

  private async getRecipientAddress(destinationAddress: string): Promise<RecipientAddress | null> {
    try {
      // Get all recipient addresses
      const response = await this.httpClient.get('/v1/businessAccount/wallets/addresses/recipient');

      if (response.data.data && Array.isArray(response.data.data)) {
        // Find address by destination address
        const recipientAddress = response.data.data.find((addr: any) => addr.address === destinationAddress && addr.currency === 'USD');

        if (recipientAddress) {
          return {
            id: recipientAddress.id,
            address: recipientAddress.address,
            addressTag: recipientAddress.addressTag,
            currency: recipientAddress.currency,
            chain: recipientAddress.chain,
            description: recipientAddress.description
          };
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Error getting recipient address:', error);
      return null;
    }
  }

  private async createRecipientAddress(destinationAddress: string): Promise<RecipientAddress | null> {
    try {
      const addressData = {
        currency: 'USD',
        chain: 'ETH',
        address: destinationAddress,
        addressTag: null,
        description: `User wallet address for USDC transfers`
      };

      const response = await this.httpClient.post('/v1/businessAccount/wallets/addresses/recipient', addressData);

      if (response.data.data) {
        return {
          id: response.data.data.id,
          address: response.data.data.address,
          addressTag: response.data.data.addressTag,
          currency: response.data.data.currency,
          chain: response.data.data.chain,
          description: response.data.data.description
        };
      }

      return null;
    } catch (error) {
      this.logger.error('Error creating recipient address:', error);
      return null;
    }
  }

  async getTransferStatus(transferId: string): Promise<TransferResult> {
    try {
      const response = await this.httpClient.get(`/v1/businessAccount/transfers/${transferId}`);
      return {
        id: response.data.data.id,
        status: response.data.data.status,
        transactionHash: response.data.data?.transactionHash
      };
    } catch (error) {
      this.logger.error('Error getting transfer status:', error);
      return {
        id: transferId,
        status: 'unknown',
        error: error.response?.data?.message || error.message
      };
    }
  }

  async getBusinessWalletBalance(): Promise<number> {
    try {
      const walletId = this.configService.get<string>('CIRCLE_BUSINESS_WALLET_ID');
      if (!walletId) {
        throw new Error('CIRCLE_BUSINESS_WALLET_ID not configured');
      }

      const response = await this.httpClient.get(`/v1/wallets/${walletId}`);
      const balances = response.data.data.balances;

      // Find USD balance
      const usdBalance = balances?.find((balance: any) => balance.currency === 'USD');
      return parseFloat(usdBalance?.amount || '0');
    } catch (error) {
      this.logger.error('Error getting business wallet balance:', error);
      return 0;
    }
  }

  async getRecipientAddresses(): Promise<RecipientAddress[]> {
    try {
      const response = await this.httpClient.get('/v1/businessAccount/wallets/addresses/recipient');

      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map((addr: any) => ({
          id: addr.id,
          address: addr.address,
          addressTag: addr.addressTag,
          currency: addr.currency,
          chain: addr.chain,
          description: addr.description
        }));
      }

      return [];
    } catch (error) {
      this.logger.error('Error getting recipient addresses:', error);
      return [];
    }
  }
}
