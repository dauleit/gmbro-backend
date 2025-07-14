import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Logger, UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { BaseController } from 'src/base/base-controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Users')
@Controller({
  path: '/users',
  version: '1'
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController extends BaseController {
  private logger: Logger = new Logger('UserController');

  constructor(private readonly userService: UserService) {
    super();
  }
}
