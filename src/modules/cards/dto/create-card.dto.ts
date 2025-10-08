import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class BillingDetailsDto {
  @ApiProperty({ description: 'Cardholder name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Billing address country' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Billing address city' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Billing address line 1' })
  @IsString()
  @IsNotEmpty()
  line1: string;

  @ApiProperty({ description: 'Billing address line 2 (optional)' })
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiProperty({ description: 'Billing address district/state' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ description: 'Billing address postal code' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

export class MetadataDto {
  @ApiProperty({ description: 'Cardholder email' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Cardholder phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'Session ID' })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({ description: 'IP Address' })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}

export class CreateCardDto {
  @ApiProperty({ description: 'Encryption key ID from Circle' })
  @IsString()
  @IsNotEmpty()
  keyId: string;

  @ApiProperty({ description: 'Encrypted card data from client' })
  @IsString()
  @IsNotEmpty()
  encryptedCardData: string;

  @ApiProperty({ description: 'Expiry month (1-12)' })
  @IsString()
  @IsNotEmpty()
  expMonth: string;

  @ApiProperty({ description: 'Expiry year (YYYY)' })
  @IsString()
  @IsNotEmpty()
  expYear: string;

  @ApiProperty({ description: 'Billing details', type: BillingDetailsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BillingDetailsDto)
  billingDetails: BillingDetailsDto;

  @ApiProperty({ description: 'Metadata', type: MetadataDto })
  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;
}
