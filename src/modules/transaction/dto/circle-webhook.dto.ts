import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsNumber, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum NotificationTypeEnum {
  TRANSACTIONS_INBOUND = 'transactions.inbound',
  TRANSACTIONS_OUTBOUND = 'transactions.outbound',
  TRANSACTIONS_PENDING = 'transactions.pending',
  TRANSACTIONS_FAILED = 'transactions.failed'
}

export enum TransactionStateEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum TransactionTypeEnum {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  TRANSFER = 'TRANSFER'
}

export class CircleNotificationDto {
  @ApiProperty({ description: 'Transaction ID' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Blockchain network' })
  @IsNotEmpty()
  @IsString()
  blockchain: string;

  @ApiProperty({ description: 'Wallet ID' })
  @IsNotEmpty()
  @IsString()
  walletId: string;

  @ApiProperty({ description: 'Token ID' })
  @IsNotEmpty()
  @IsString()
  tokenId: string;

  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Source address', required: false })
  @IsOptional()
  @IsString()
  sourceAddress?: string;

  @ApiProperty({ description: 'Destination address' })
  @IsNotEmpty()
  @IsString()
  destinationAddress: string;

  @ApiProperty({ description: 'Transaction amounts', type: [String] })
  @IsArray()
  @IsString({ each: true })
  amounts: string[];

  @ApiProperty({ description: 'NFT token IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  nftTokenIds: string[];

  @ApiProperty({ description: 'Transaction state', enum: TransactionStateEnum })
  @IsNotEmpty()
  @IsEnum(TransactionStateEnum)
  state: TransactionStateEnum;

  @ApiProperty({ description: 'Error reason', required: false })
  @IsOptional()
  @IsString()
  errorReason?: string;

  @ApiProperty({ description: 'Transaction type', enum: TransactionTypeEnum })
  @IsNotEmpty()
  @IsEnum(TransactionTypeEnum)
  transactionType: TransactionTypeEnum;

  @ApiProperty({ description: 'Transaction hash', required: false })
  @IsOptional()
  @IsString()
  txHash?: string;

  @ApiProperty({ description: 'Creation date' })
  @IsNotEmpty()
  @IsString()
  createDate: string;

  @ApiProperty({ description: 'Update date' })
  @IsNotEmpty()
  @IsString()
  updateDate: string;

  @ApiProperty({ description: 'Error details', required: false })
  @IsOptional()
  errorDetails?: any;

  @ApiProperty({ description: 'Network fee', required: false })
  @IsOptional()
  @IsString()
  networkFee?: string;

  @ApiProperty({ description: 'User op hash', required: false })
  @IsOptional()
  @IsString()
  userOpHash?: string;

  @ApiProperty({ description: 'Reference ID', required: false })
  @IsOptional()
  @IsString()
  refId?: string;
}

export class CircleWebhookDto {
  @ApiProperty({ description: 'Subscription ID' })
  @IsNotEmpty()
  @IsString()
  subscriptionId: string;

  @ApiProperty({ description: 'Notification ID' })
  @IsNotEmpty()
  @IsString()
  notificationId: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationTypeEnum })
  @IsNotEmpty()
  @IsEnum(NotificationTypeEnum)
  notificationType: NotificationTypeEnum;

  @ApiProperty({ description: 'Notification data', type: CircleNotificationDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CircleNotificationDto)
  notification: CircleNotificationDto;

  @ApiProperty({ description: 'Webhook timestamp' })
  @IsNotEmpty()
  @IsString()
  timestamp: string;

  @ApiProperty({ description: 'Webhook version' })
  @IsNotEmpty()
  @IsNumber()
  version: number;
}
