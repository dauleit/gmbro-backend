import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDCAPlanBlockchainDto {
  @ApiProperty({
    description: 'Token In contract address',
    example: '0x1234567890123456789012345678901234567890'
  })
  @IsString()
  @IsNotEmpty()
  tokenIn: string;

  @ApiProperty({
    description: 'Token Out contract address',
    example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
  })
  @IsString()
  @IsNotEmpty()
  tokenOut: string;

  @ApiProperty({
    description: 'Amount per interval (in USDC units)',
    example: 100
  })
  @IsNumber()
  @Min(0.01)
  amountPerInterval: number;

  @ApiProperty({
    description: 'Interval in seconds',
    example: 86400
  })
  @IsNumber()
  @Min(60)
  interval: number;

  @ApiProperty({
    description: 'User system fee (in USDC units)',
    example: 5
  })
  @IsNumber()
  @Min(0)
  userSystemFee: number;

  @ApiProperty({
    description: 'User transaction fee (in USDC units)',
    example: 2
  })
  @IsNumber()
  @Min(0)
  userTransactionFee: number;

  @ApiProperty({
    description: 'DCA contract address',
    example: '0xcontract123456789012345678901234567890123456'
  })
  @IsString()
  @IsNotEmpty()
  contractAddress: string;

  @ApiPropertyOptional({
    description: 'Reference ID for the transaction',
    example: 'dca-create-plan-123'
  })
  @IsOptional()
  @IsString()
  refId?: string;
}
