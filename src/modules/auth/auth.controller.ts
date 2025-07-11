import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Logger } from '@nestjs/common';

import { AuthService } from './auth.service';
import { BaseController } from 'src/base/base-controller';

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
}
