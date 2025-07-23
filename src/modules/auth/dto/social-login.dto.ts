import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum SocialProvider {
  TELEGRAM = 'telegram',
  X = 'x',
  GMAIL = 'gmail'
}

export class TelegramLoginDto {
  @ApiProperty({
    description: 'Telegram user ID',
    example: '123456789'
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Telegram first name',
    example: 'John'
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Telegram last name',
    example: 'Doe',
    required: false
  })
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Telegram username',
    example: 'johndoe',
    required: false
  })
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Telegram photo URL',
    example: 'https://t.me/i/userpic/320/johndoe.jpg',
    required: false
  })
  @IsString()
  photoUrl?: string;

  @ApiProperty({
    description: 'Telegram auth date',
    example: '1234567890'
  })
  @IsString()
  @IsNotEmpty()
  authDate: string;

  @ApiProperty({
    description: 'Telegram hash for verification',
    example: 'abc123def456'
  })
  @IsString()
  @IsNotEmpty()
  hash: string;
}

export class XLoginDto {
  @ApiProperty({
    description: 'X (Twitter) OAuth code',
    example: 'abc123def456'
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'X (Twitter) state parameter',
    example: 'state123',
    required: false
  })
  @IsString()
  state?: string;
}

export class GmailLoginDto {
  @ApiProperty({
    description: 'Gmail OAuth code',
    example: 'abc123def456'
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  accessToken?: string;

  @ApiProperty({
    description: 'Gmail OAuth id token',
    example: 'abc123def456'
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  idToken?: string;

  @ApiProperty()
  userInfo: {
    id: string;
    email: string;
    verifiedEmail: boolean;
    name: string;
    givenName: string;
    familyName?: string;
    picture?: string;
  };
}

export class SocialLoginDto {
  @ApiProperty({
    description: 'Social provider type',
    enum: SocialProvider,
    example: SocialProvider.TELEGRAM
  })
  @IsEnum(SocialProvider)
  @IsNotEmpty()
  provider: SocialProvider;

  @ApiProperty({
    description: 'Social login data',
    oneOf: [{ $ref: '#/components/schemas/TelegramLoginDto' }, { $ref: '#/components/schemas/XLoginDto' }, { $ref: '#/components/schemas/GmailLoginDto' }]
  })
  @IsNotEmpty()
  data: TelegramLoginDto | XLoginDto | GmailLoginDto;
}
