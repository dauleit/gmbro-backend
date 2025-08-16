import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateTransferDto {
  amount: number;
  destinationAddress: string;
  userId: string;
}

export interface TransferResult {
  id: string;
  challengeId: string;
  status: string;
}

export interface CompleteTransferResult {
  id: string;
  status: string;
  transactionHash: string;
}

@Injectable()
export class CircleService {
  private readonly logger = new Logger(CircleService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('CIRCLE_API_KEY');
    this.baseUrl = this.configService.get<string>('CIRCLE_API_URL') || 'https://api-sandbox.circle.com';

    if (!this.apiKey) {
      throw new Error('CIRCLE_API_KEY is not configured');
    }
  }

  async createTransfer(createTransferDto: CreateTransferDto): Promise<TransferResult> {
    try {
      // Gọi Circle API để tạo transfer
      const response = await fetch(`${this.baseUrl}/v1/transfers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: {
            type: 'wallet',
            id: createTransferDto.userId // ID của user's wallet
          },
          destination: {
            type: 'blockchain',
            address: createTransferDto.destinationAddress,
            chain: 'ETH' // Ethereum mainnet
          },
          amount: {
            amount: createTransferDto.amount.toString(),
            currency: 'USD'
          },
          idempotencyKey: `transfer_${Date.now()}_${createTransferDto.userId}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Circle API error: ${errorData.message || response.statusText}`);
      }

      const transferData = await response.json();

      this.logger.log(`Created Circle transfer: ${transferData.data.id}`);

      return {
        id: transferData.data.id,
        challengeId: transferData.data.challengeId,
        status: transferData.data.status
      };
    } catch (error) {
      this.logger.error('Error creating Circle transfer:', error);
      throw error;
    }
  }

  async completeTransfer(transferId: string, signature: string): Promise<CompleteTransferResult> {
    try {
      // Gọi Circle API để hoàn tất transfer
      const response = await fetch(`${this.baseUrl}/v1/transfers/${transferId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challengeId: signature
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Circle API error: ${errorData.message || response.statusText}`);
      }

      const completeData = await response.json();

      this.logger.log(`Completed Circle transfer: ${transferId}`);

      return {
        id: completeData.data.id,
        status: completeData.data.status,
        transactionHash: completeData.data.transactionHash
      };
    } catch (error) {
      this.logger.error('Error completing Circle transfer:', error);
      throw error;
    }
  }

  async getTransferStatus(transferId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/transfers/${transferId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Circle API error: ${errorData.message || response.statusText}`);
      }

      const transferData = await response.json();
      return transferData.data;
    } catch (error) {
      this.logger.error('Error getting transfer status:', error);
      throw error;
    }
  }
}
