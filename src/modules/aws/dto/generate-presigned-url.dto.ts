import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePresignedUrlDto {
  @ApiProperty({ type: String })
  @IsString()
  extension: string;

  @ApiProperty({ type: String })
  @IsString()
  folder: string;

  @ApiProperty({ type: String })
  @IsString()
  contentType: string;
}
