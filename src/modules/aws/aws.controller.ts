import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/base/base-controller';
import { AwsService } from './aws.service';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';
import { Response } from 'express';
import { ERROR_MESSAGES } from 'src/common/constant';
import { GenerateMultiPresignedUrlDto } from './dto/generate-multi-presigned-url.dto';

@ApiTags('AWS')
@Controller({
  path: '/aws',
  version: '1'
})
export class AWSController extends BaseController {
  constructor(private readonly awsService: AwsService) {
    super();
  }
  @Post('/generate-presigned-url')
  async generatePresignedUrl(@Body() body: GeneratePresignedUrlDto, @Res() res: Response): Promise<Response> {
    try {
      const response = await this.awsService.generatePresignedUrl(body);
      return this.responseSuccess(res, response);
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST) {
        return this.responseBadRequest(res, { message: error.response.message });
      }
      return this.responseInternalServerError(res, { message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR, data: error });
    }
  }

  @Post('/generate-multi-presigned-url')
  async generateMultiPresignedUrl(@Body() body: GenerateMultiPresignedUrlDto, @Res() res: Response): Promise<Response> {
    try {
      const response = await this.awsService.generateMultiPresignedUrl(body);
      return this.responseSuccess(res, response);
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST) {
        return this.responseBadRequest(res, { message: error.response.message });
      }
      return this.responseInternalServerError(res, { message: ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR, data: error });
    }
  }
}
