import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveUSDCDto {
  @ApiProperty({
    description: 'Contract address to approve USDC for',
    example: '0x1234567890123456789012345678901234567890'
  })
  @IsString()
  @IsNotEmpty()
  contractAddress: string;

  @ApiProperty({
    description: 'EC2 contract address',
    example: '0xec2contract123456789012345678901234567890123456'
  })
  @IsString()
  @IsNotEmpty()
  ec2ContractAddress: string;

  @ApiProperty({
    description: 'Amount of USDC to approve (in USDC units)',
    example: 1000
  })
  @IsNumber({}, { message: 'amount must be a valid number' })
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({
    description: 'Reference ID for the transaction',
    example: 'dca-approve-123'
  })
  @IsOptional()
  @IsString()
  refId?: string;
}
