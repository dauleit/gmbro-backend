import { Controller, Post, Get, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { BaseController } from 'src/base/base-controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { IUser } from '../user/interfaces/user.interface';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Transfers')
@Controller({
  path: '/transfers',
  version: '1'
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TransferController extends BaseController {
  constructor(private readonly transferService: TransferService) {
    super();
  }

  /**
   * Estimate transfer fee
   * @param createTransferDto - Transfer data for estimation
   * @param user - Current user
   * @param res - Express response object
   * @returns Promise<Response> - Fee estimation response
   */
  @Post('/estimate-fee')
  @ApiOperation({ summary: 'Estimate transfer fee' })
  @ApiResponse({ status: 200, description: 'Fee estimated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async estimateFee(@Body() createTransferDto: CreateTransferDto, @CurrentUser() user: IUser, @Res() res: Response): Promise<Response> {
    try {
      const response = await this.transferService.estimateFee(user, createTransferDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  /**
   * Create a new transfer
   * @param createTransferDto - Transfer data
   * @param user - Current user
   * @param res - Express response object
   * @returns Promise<Response> - Created transfer response
   */
  @Post()
  @ApiOperation({ summary: 'Create a new transfer' })
  @ApiResponse({ status: 201, description: 'Transfer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async createTransfer(@Body() createTransferDto: CreateTransferDto, @CurrentUser() user: IUser, @Res() res: Response): Promise<Response> {
    try {
      const response = await this.transferService.createTransfer(user, createTransferDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      console.log(error);
      return this.responseError(res, error.response);
    }
  }

  /**
   * Get transfer by ID
   * @param id - Transfer ID
   * @param user - Current user
   * @param res - Express response object
   * @returns Promise<Response> - Transfer response
   */
  @Get(':id')
  async getTransferById(@Param('id') id: string, @CurrentUser() user: IUser, @Res() res: Response): Promise<Response> {
    try {
      const response = await this.transferService.getTransferById(id, user.id);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  /**
   * Get user's transfers with pagination
   * @param page - Page number
   * @param limit - Items per page
   * @param user - Current user
   * @param res - Express response object
   * @returns Promise<Response> - Transfers response
   */
  @Get()
  async getUserTransfers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser() user: IUser,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      const response = await this.transferService.getUserTransfers(user.id, pageNum, limitNum);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }
}
