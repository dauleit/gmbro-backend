import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { TRANSACTION_STATUS, TransactionTypeEnum } from 'src/common/constants';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Transaction type', enum: TransactionTypeEnum })
  @IsNotEmpty()
  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  user: string;

  @ApiProperty({ description: 'Payment ID', required: false })
  @IsOptional()
  @IsString()
  payment?: string;

  @ApiProperty({ description: 'Wallet ID', required: false })
  @IsOptional()
  wallet?: string;

  @ApiProperty({ description: 'Destination address' })
  @IsNotEmpty()
  @IsString()
  destinationAddress: string;

  @ApiProperty({ description: 'Transaction amount' })
  @IsNotEmpty()
  @IsString()
  amount: string;

  @ApiProperty({ description: 'Transaction status', enum: TRANSACTION_STATUS })
  @IsEnum(TRANSACTION_STATUS)
  @IsOptional()
  status: TRANSACTION_STATUS;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Transaction hash', required: false })
  @IsOptional()
  @IsString()
  txHash?: string;

  @ApiProperty({ description: 'Source address', required: false })
  @IsOptional()
  @IsString()
  sourceAddress?: string;

  @ApiProperty({ description: 'Network fee', required: false })
  @IsOptional()
  @IsString()
  networkFee?: string;

  @ApiProperty({ description: 'Process fee', required: false })
  @IsOptional()
  @IsString()
  processFee?: string;

  @ApiProperty({ description: 'Total amount', required: false })
  @IsOptional()
  @IsString()
  totalAmount?: string;

  @ApiProperty({ description: 'Reference ID for transaction', required: false })
  @IsOptional()
  @IsString()
  refId?: string;
}
