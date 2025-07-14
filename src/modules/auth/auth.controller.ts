import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Logger, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { BaseController } from 'src/base/base-controller';
import { SocialLoginDto } from './dto/social-login.dto';

@ApiTags('Authentication')
@Controller({
  path: '/auth',
  version: '1'
})
@ApiBearerAuth()
export class AuthController extends BaseController {
  private logger: Logger = new Logger('AuthController');

  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('social-login')
  @ApiOperation({
    summary: 'Social login with Telegram, X (Twitter), or Gmail',
    description: 'Authenticate user using social media providers'
  })
  async socialLogin(@Body() socialLoginDto: SocialLoginDto, @Res() res: Response) {
    this.logger.log(`Social login request received for provider: ${socialLoginDto.provider}`);

    const result = await this.authService.socialLogin(socialLoginDto);
    return this.responseSuccess(res, result);
  }
}
