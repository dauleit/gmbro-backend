import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Logger, UseGuards, Get, Res } from '@nestjs/common';
import { Response } from 'express';

import { UserService } from './user.service';
import { BaseController } from 'src/base/base-controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { IUser } from './interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/current-user';

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

  @Get('/me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMyProfile(@CurrentUser() user: IUser, @Res() res: Response) {
    try {
      const response = await this.userService.getUserProfile(user._id.toString());
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }
}
