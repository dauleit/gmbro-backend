import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SocialLinksDto {
  @ApiPropertyOptional({
    description: 'Link Twitter',
    example: 'https://twitter.com/Tether_to'
  })
  @IsOptional()
  @IsUrl()
  twitter?: string;

  @ApiPropertyOptional({
    description: 'Link Telegram official',
    example: 'https://t.me/OfficialTether'
  })
  @IsOptional()
  @IsUrl()
  telegram?: string;

  @ApiPropertyOptional({
    description: 'Link Discord official',
    example: 'https://discord.gg/tether'
  })
  @IsOptional()
  @IsUrl()
  discord?: string;

  @ApiPropertyOptional({
    description: 'Link GitHub repository',
    example: 'https://github.com/tetherto'
  })
  @IsOptional()
  @IsUrl()
  github?: string;
}

export class MetadataDto {
  @ApiPropertyOptional({
    description: 'Official website of the token',
    example: 'https://tether.to/'
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'Link to whitepaper',
    example: 'https://tether.to/transparency/'
  })
  @IsOptional()
  @IsUrl()
  whitepaper?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the token',
    example: 'Tether (USDT) is a cryptocurrency with a value meant to mirror the value of the U.S. dollar...'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Social links',
    type: SocialLinksDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}

export class CreateTokenDto {
  @ApiProperty({
    description: 'Token symbol (uppercase)',
    example: 'USDT',
    required: true
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Full name of the token',
    example: 'Tether',
    required: true
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Smart contract address of the token',
    example: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    required: true
  })
  @IsString()
  contractAddress: string;

  @ApiProperty({
    description: 'Current price (USD)',
    example: 1.001,
    required: true
  })
  @IsNumber()
  currentPrice: number;

  @ApiProperty({
    description: 'Price change 24h (USD)',
    example: 0.001,
    required: true
  })
  @IsNumber()
  priceChange24h: number;

  @ApiProperty({
    description: 'Percentage change 24h',
    example: 0.1,
    required: true
  })
  @IsNumber()
  priceChangePercentage24h: number;

  @ApiPropertyOptional({
    description: 'Verified status (checkmark)',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'URL icon of the token',
    example: 'https://assets.coingecko.com/coins/images/325/large/Tether.png'
  })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'Abbreviation for icon',
    example: 'US'
  })
  @IsOptional()
  @IsString()
  iconInitials?: string;

  @ApiPropertyOptional({
    description: 'Price history (array of numbers)',
    example: [1.001, 1.002, 1.0, 0.999],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  priceHistory?: number[];

  @ApiPropertyOptional({
    description: 'Date corresponding to price history',
    example: ['2024-01-15T10:00:00Z', '2024-01-15T11:00:00Z'],
    type: [Date]
  })
  @IsOptional()
  @IsArray()
  priceHistoryDates?: Date[];

  @ApiPropertyOptional({
    description: 'Active status of the token',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Featured status of the token',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Market cap (USD)',
    example: 95000000000
  })
  @IsOptional()
  @IsNumber()
  marketCap?: number;

  @ApiPropertyOptional({
    description: '24h trading volume (USD)',
    example: 50000000000
  })
  @IsOptional()
  @IsNumber()
  volume24h?: number;

  @ApiPropertyOptional({
    description: 'Circulating supply',
    example: 95000000000
  })
  @IsOptional()
  @IsNumber()
  circulatingSupply?: number;

  @ApiPropertyOptional({
    description: 'Maximum supply (if applicable)',
    example: null
  })
  @IsOptional()
  @IsNumber()
  maxSupply?: number;

  @ApiPropertyOptional({
    description: 'Quote currency',
    example: 'USD',
    default: 'USD'
  })
  @IsOptional()
  @IsString()
  quoteCurrency?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata of the token',
    type: MetadataDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}
