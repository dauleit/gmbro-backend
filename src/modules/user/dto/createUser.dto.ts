import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsArray, IsObject, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'Authentication provider',
    example: 'telegram',
    enum: ['telegram', 'x', 'gmail', 'email']
  })
  @IsString()
  provider: string;

  @ApiProperty({
    description: 'Provider user ID',
    example: '123456789'
  })
  @IsString()
  providerId: string;

  @ApiProperty({
    description: 'User roles',
    example: ['user'],
    required: false
  })
  @IsArray()
  @IsOptional()
  roles?: string[];

  @ApiProperty({
    description: 'Additional metadata',
    example: { telegramUsername: 'johndoe' },
    required: false
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
