import { IsString, IsNotEmpty, IsOptional, IsNumberString, Matches, ValidateNested, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FeeConfigDto {
  @ApiProperty({
    description: 'Fee level for the transaction',
    example: 'MEDIUM',
    enum: ['LOW', 'MEDIUM', 'HIGH']
  })
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH'], {
    message: 'feeLevel must be one of: LOW, MEDIUM, HIGH'
  })
  feeLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class FeeDto {
  @ApiProperty({
    description: 'Fee type',
    example: 'level',
    enum: ['level']
  })
  @IsString()
  @IsIn(['level'], {
    message: 'type must be "level"'
  })
  type: 'level';

  @ApiProperty({
    description: 'Fee configuration',
    type: FeeConfigDto
  })
  @ValidateNested()
  @Type(() => FeeConfigDto)
  config: FeeConfigDto;
}

export class CreateTransferDto {
  @ApiProperty({
    description: 'Destination Ethereum address for the transfer',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    pattern: '^0x[a-fA-F0-9]{40}$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'destinationAddress must be a valid Ethereum address'
  })
  destinationAddress: string;

  @ApiProperty({
    description: 'Amount to transfer (as string)',
    example: '100.50',
    pattern: '^[0-9]+(\\.[0-9]+)?$'
  })
  @IsString()
  @IsNotEmpty()
  @IsNumberString(
    {},
    {
      message: 'amount must be a valid number string'
    }
  )
  amount: string;

  @ApiPropertyOptional({
    description: 'Token ID to transfer (defaults to USDC)',
    example: 'USDC',
    default: 'USDC'
  })
  @IsOptional()
  @IsString()
  tokenId?: string;

  @ApiPropertyOptional({
    description: 'Optional memo/note for the transfer',
    example: 'Payment for services',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiPropertyOptional({
    description: 'Fee configuration for the transfer',
    type: FeeDto,
    example: {
      type: 'level',
      config: {
        feeLevel: 'MEDIUM'
      }
    },
    default: {
      type: 'level',
      config: {
        feeLevel: 'MEDIUM'
      }
    }
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FeeDto)
  fee?: FeeDto;
}
