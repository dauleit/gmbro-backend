import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum, IsNumberString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DCAPlanType } from '../schemas/dca-plan.schema';

export class CreateDCAPlanDto {
  @ApiProperty({
    description: 'Input token for the DCA plan',
    example: 'USDC'
  })
  @IsString()
  @IsNotEmpty()
  tokenIn: string;

  @ApiProperty({
    description: 'Output token for the DCA plan',
    example: 'ETH'
  })
  @IsString()
  @IsNotEmpty()
  tokenOut: string;

  @ApiProperty({
    description: 'Amount per trade',
    example: '100.50'
  })
  @IsString()
  @IsNotEmpty()
  @IsNumberString(
    {},
    {
      message: 'unitPerTrade must be a valid number string'
    }
  )
  unitPerTrade: string;

  @ApiProperty({
    description: 'Trading frequency'
  })
  @IsNotEmpty()
  @IsNumber()
  frequency: number;

  @ApiProperty({
    description: 'Total number of trades planned',
    example: 30
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  total_trades: number;

  @ApiPropertyOptional({
    description: 'System fee for the plan',
    example: '5.00'
  })
  @IsOptional()
  @IsString()
  @IsNumberString(
    {},
    {
      message: 'systemFee must be a valid number string'
    }
  )
  systemFee?: string;

  @ApiPropertyOptional({
    description: 'Estimated gas fee for the plan',
    example: '0.01'
  })
  @IsOptional()
  @IsString()
  @IsNumberString(
    {},
    {
      message: 'planGasFee must be a valid number string'
    }
  )
  planGasFee?: string;

  @ApiPropertyOptional({
    description: 'When the plan starts',
    example: '2024-01-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'When the plan ends',
    example: '2024-01-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  planEndTime?: string;

  @ApiPropertyOptional({
    description: 'Contract plan ID from blockchain',
    example: 'plan_1703123456_abc123def'
  })
  @IsOptional()
  @IsString()
  contractPlanId?: string;

  @ApiPropertyOptional({
    description: 'Transaction hash for plan creation',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
  @IsOptional()
  @IsString()
  txhash?: string;

  @ApiPropertyOptional({
    description: 'Transaction fee for plan creation',
    example: '150000'
  })
  @IsOptional()
  @IsString()
  @IsNumberString({}, { message: 'txfee must be a valid number string' })
  txfee?: string;

  @ApiProperty({
    description: 'DCA type',
    example: 'buy'
  })
  @IsEnum(DCAPlanType)
  dcaType: DCAPlanType;
}
