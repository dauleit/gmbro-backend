import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GeneratePresignedUrlDto } from './generate-presigned-url.dto';

export class GenerateMultiPresignedUrlDto {
  @ApiProperty({ type: [GeneratePresignedUrlDto] })
  @IsArray()
  files: GeneratePresignedUrlDto[];
}
