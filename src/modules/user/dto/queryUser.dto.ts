import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryUserDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term for name, email, or phone',
    example: 'john',
    required: false
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filter by provider',
    example: 'telegram',
    enum: ['telegram', 'x', 'gmail', 'email'],
    required: false
  })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiProperty({
    description: 'Filter by roles',
    example: ['user', 'admin'],
    required: false
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  roles?: string[];

  @ApiProperty({
    description: 'Sort by field',
    example: 'createdAt',
    required: false
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false
  })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
