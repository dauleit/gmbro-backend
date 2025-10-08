import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Logger, UseGuards, Get, Post, Res, Body } from '@nestjs/common';
import { Response } from 'express';

import { CardsService } from './cards.service';
import { BaseController } from 'src/base/base-controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateCardDto } from './dto/create-card.dto';
import { IUser } from '../user/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/current-user';

@ApiTags('Cards')
@Controller({
  path: '/cards',
  version: '1'
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CardsController extends BaseController {
  private logger: Logger = new Logger('CardsController');

  constructor(private readonly cardsService: CardsService) {
    super();
  }

  @Get('/encryption-key')
  @ApiOperation({ summary: 'Get public encryption key from Circle' })
  @ApiResponse({ status: 200, description: 'Encryption key retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getEncryptionKey(@Res() res: Response) {
    try {
      const response = await this.cardsService.getEncryptionKey();
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error.response);
    }
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a new card' })
  @ApiResponse({ status: 201, description: 'Card created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createCard(@CurrentUser() user: IUser, @Res() res: Response, @Body() cardData: CreateCardDto) {
    try {
      const response = await this.cardsService.createCard(cardData, user._id.toString());
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all cards of current user' })
  @ApiResponse({ status: 200, description: 'Cards retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserCards(@CurrentUser() user: IUser, @Res() res: Response) {
    try {
      const response = await this.cardsService.getUserCards(user._id.toString());
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }
}
