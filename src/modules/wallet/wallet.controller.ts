import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Logger, Post, Get, Res, UseGuards, Param, Query } from '@nestjs/common';
import { Response } from 'express';

import { WalletService } from './wallet.service';
import { BaseController } from 'src/base/base-controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { IUser } from '../user/interfaces/user.interface';

@ApiTags('Wallets')
@Controller({
  path: '/wallets',
  version: '1'
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController extends BaseController {
  private logger: Logger = new Logger('WalletController');

  constructor(private readonly walletService: WalletService) {
    super();
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a wallet' })
  @ApiResponse({ status: 201, description: 'Wallet created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - wallet already exists or not created on Circle' })
  async createWallet(@CurrentUser() user: IUser, @Res() res: Response) {
    try {
      const response = await this.walletService.createWallet(user);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Post('/request')
  @ApiOperation({ summary: 'Request create a wallet' })
  async requestCreateWallet(@CurrentUser() user: IUser, @Res() res: Response) {
    try {
      const response = await this.walletService.requestCreateWallet(user);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/my-wallet')
  @ApiOperation({ summary: 'Get my wallet' })
  async getMyWallet(@CurrentUser() user: IUser, @Res() res: Response) {
    try {
      const response = await this.walletService.getMyWallet(user);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error.response);
    }
  }

  @Get('/balance/:currency')
  @ApiOperation({ summary: 'Get wallet balance for specific currency' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getWalletBalanceByCurrency(@CurrentUser() user: IUser, @Res() res: Response, @Param('currency') currency: string) {
    try {
      const response = await this.walletService.getWalletBalanceByCurrency(user, currency);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getWalletTransactions(@CurrentUser() user: IUser, @Res() res: Response, @Query('limit') limit?: number) {
    try {
      const response = await this.walletService.getWalletTransactions(user, limit);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/details')
  @ApiOperation({ summary: 'Get detailed wallet information from Circle' })
  @ApiResponse({ status: 200, description: 'Wallet details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getWalletDetails(@CurrentUser() user: IUser, @Res() res: Response) {
    try {
      const response = await this.walletService.getWalletDetails(user);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }
}
