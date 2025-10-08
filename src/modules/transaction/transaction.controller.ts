import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Controller, Logger, UseGuards, Get, Post, Put, Delete, Res, Body, Param, Query, Headers } from '@nestjs/common';
import { Response } from 'express';

import { TransactionService } from './transaction.service';
import { BaseController } from 'src/base/base-controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { IUser } from '../user/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/current-user';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';
import { CreateTransactionDto } from './dto/createTransaction.dto';

@ApiTags('Transactions')
@Controller({
  path: '/transactions',
  version: '1'
})
@ApiBearerAuth()
export class TransactionController extends BaseController {
  private logger: Logger = new Logger('TransactionController');

  constructor(private readonly transactionService: TransactionService) {
    super();
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createTransaction(@CurrentUser() user: IUser, @Res() res: Response, @Body() transactionData: CreateTransactionDto) {
    try {
      const response = await this.transactionService.create(transactionData);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all transactions with optional filters' })
  @ApiQuery({ name: 'page', required: false, description: 'Filter by page' })
  @ApiQuery({ name: 'limit', required: false, description: 'Filter by limit' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllTransactions(@CurrentUser() user: IUser, @Res() res: Response, @Query('page') page?: string, @Query('limit') limit?: string) {
    try {
      const response = await this.transactionService.findAll(user._id.toString(), parseInt(page), parseInt(limit));
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/wallet/:walletId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get transactions for a specific wallet' })
  @ApiParam({ name: 'walletId', description: 'Wallet ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of transactions to return', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of transactions to skip', type: Number })
  @ApiResponse({ status: 200, description: 'Wallet transactions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWalletTransactions(
    @CurrentUser() user: IUser,
    @Res() res: Response,
    @Param('walletId') walletId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    try {
      const limitNum = limit ? parseInt(limit) : 10;
      const offsetNum = offset ? parseInt(offset) : 0;
      const response = await this.transactionService.getWalletTransactions(walletId, limitNum, offsetNum);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTransactionById(@CurrentUser() user: IUser, @Res() res: Response, @Param('id') id: string) {
    try {
      const transaction = await this.transactionService.findById(id);
      return this.responseSuccess(res, {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: { transaction }
      });
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/hash/:txHash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get transaction by transaction hash' })
  @ApiParam({ name: 'txHash', description: 'Transaction hash' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTransactionByHash(@CurrentUser() user: IUser, @Res() res: Response, @Param('txHash') txHash: string) {
    try {
      const transaction = await this.transactionService.findByTxHash(txHash);
      return this.responseSuccess(res, {
        message: ERROR_MESSAGES.common.SUCCESSFUL,
        data: { transaction }
      });
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteTransaction(@CurrentUser() user: IUser, @Res() res: Response, @Param('id') id: string) {
    try {
      const response = await this.transactionService.delete(id);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Post('/webhook/circle')
  @ApiOperation({ summary: 'Circle transaction webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async handleCircleTransactionWebhook(@Res() res: Response, @Body() webhookData: any, @Headers() headers: any) {
    try {
      const response = await this.transactionService.processCircleWebhook(webhookData, headers);
      console.log(response);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseSuccess(res, error.response);
    }
  }

  @Get('/ref/:refId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get transaction by refId' })
  @ApiParam({ name: 'refId', description: 'Reference ID of the transaction' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTransactionByRefId(@Param('refId') refId: string, @Res() res: Response): Promise<Response> {
    try {
      const response = await this.transactionService.getTransactionByRefId(refId);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }
}
