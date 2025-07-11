import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';
import { IResponseData } from 'src/base/base-controller';
import { randomUUID } from 'crypto';
import { ConfigService } from 'src/configs/config.service';
import { ERROR_MESSAGES } from 'src/common/constant';
import { GenerateMultiPresignedUrlDto } from './dto/generate-multi-presigned-url.dto';

@Injectable()
export class AwsService {
  private s3: S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION')
    });
  }

  async generatePresignedUrl(body: GeneratePresignedUrlDto): Promise<IResponseData> {
    const fileName = randomUUID();
    const key = `${body.folder}/${fileName}.${body.extension}`;
    const params = {
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: key,
      Expires: 600,
      ContentType: body.contentType
    };
    const url = await this.s3.getSignedUrlPromise('putObject', params);

    return {
      message: ERROR_MESSAGES.common.CREATED,
      data: {
        uploadUrl: url,
        endpoint: `${this.configService.get('AWS_ENDPOINT')}/${key}`
      }
    };
  }

  async generateMultiPresignedUrl(body: GenerateMultiPresignedUrlDto): Promise<IResponseData> {
    const response = [];
    for (const file of body.files) {
      const data = await this.generatePresignedUrl(file);
      if (data.data) {
        response.push(data.data);
      }
    }

    return {
      message: ERROR_MESSAGES.common.CREATED,
      data: {
        files: response
      }
    };
  }
}
