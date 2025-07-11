import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserLogoutDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  deviceToken?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  deviceType: 'WEB' | 'IOS' | 'ANDROID';
}
