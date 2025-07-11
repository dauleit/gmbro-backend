import { IsNotEmpty, IsString } from 'class-validator';

export class AWSConfig {
  @IsNotEmpty()
  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsNotEmpty()
  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsNotEmpty()
  @IsString()
  AWS_REGION: string;
}
