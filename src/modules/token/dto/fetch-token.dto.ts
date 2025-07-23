import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FetchTokenDto {
  @ApiProperty({
    description: 'Coin ID from CoinGecko (e.g., ethereum, polygon, binance-smart-chain)',
    example: 'ethereum',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  coinId: string;

  @ApiProperty({
    description: 'Smart contract address of the token',
    example: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  contractAddress: string;
}
