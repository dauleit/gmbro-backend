import { Controller, Get, Post, Param, Query, UseGuards, Res, Body } from '@nestjs/common';
import { Response } from 'express';
import { DCAPlanService } from './dca-plan.service';
import { CreateDCAPlanDto } from './dto/create-dca-plan.dto';
import { ApproveUSDCDto } from './dto/approve-usdc.dto';
import { CreateDCAPlanBlockchainDto } from './dto/create-dca-plan-blockchain.dto';
import { BaseController } from 'src/base/base-controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { IUser } from '../user/interfaces/user.interface';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('DCA Plans')
@Controller({
  path: '/dca-plans',
  version: '1'
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DCAPlanController extends BaseController {
  constructor(private readonly dcaPlanService: DCAPlanService) {
    super();
  }

  /**
   * Create a new DCA plan
   * @param createDCAPlanDto - DCA plan data
   * @param user - Current user
   * @param res - Express response object
   * @returns Promise<Response> - Created DCA plan response
   */
  @Post()
  @ApiOperation({ summary: 'Create a new DCA plan' })
  @ApiResponse({ status: 201, description: 'DCA plan created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createDCAPlan(@Body() createDCAPlanDto: CreateDCAPlanDto, @CurrentUser() user: IUser, @Res() res: Response): Promise<Response> {
    try {
      const response = await this.dcaPlanService.createDCAPlan(user, createDCAPlanDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  /**
   * Get DCA plan by ID
   * @param id - DCA plan ID
   * @param user - Current user
   * @param res - Express response object
   * @returns Promise<Response> - DCA plan response
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get DCA plan by ID' })
  @ApiResponse({ status: 200, description: 'DCA plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'DCA plan not found' })
  async getDCAPlanById(@Param('id') id: string, @CurrentUser() user: IUser, @Res() res: Response): Promise<Response> {
    try {
      const response = await this.dcaPlanService.getDCAPlanById(id, user.id);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  /**
   * Get user's DCA plans with pagination
   * @param page - Page number
   * @param limit - Items per page
   * @param user - Current user
   * @param res - Express response object
   * @returns Promise<Response> - DCA plans response
   */
  @Get()
  @ApiOperation({ summary: 'Get user DCA plans' })
  @ApiResponse({ status: 200, description: 'DCA plans retrieved successfully' })
  async getUserDCAPlans(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @CurrentUser() user: IUser,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      const response = await this.dcaPlanService.getUserDCAPlans(user.id, pageNum, limitNum);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  /**
   * Get DCA plans by status
   * @param status - DCA plan status
   * @param page - Page number
   * @param limit - Items per page
   * @param res - Express response object
   * @returns Promise<Response> - DCA plans response
   */
  @Get('/status/:status')
  @ApiOperation({ summary: 'Get DCA plans by status' })
  @ApiResponse({ status: 200, description: 'DCA plans retrieved successfully' })
  async getDCAPlansByStatus(
    @Param('status') status: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Res() res: Response
  ): Promise<Response> {
    try {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      const response = await this.dcaPlanService.getDCAPlansByStatus(status, pageNum, limitNum);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  /**
   * Approve USDC token for DCA contract
   */
  @Post('/approve-usdc')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve USDC token for DCA contract' })
  @ApiResponse({ status: 200, description: 'USDC approval challenge created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async approveUSDC(@Body() approveUSDCDto: ApproveUSDCDto, @CurrentUser() user: IUser, @Res() res: Response): Promise<Response> {
    try {
      const response = await this.dcaPlanService.approveUSDC(user, approveUSDCDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  /**
   * Create DCA plan on blockchain using Circle challenge
   */
  @Post('/create-blockchain')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create DCA plan on blockchain using Circle challenge' })
  @ApiResponse({ status: 200, description: 'DCA plan blockchain challenge created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createDCAPlanBlockchain(
    @Body() createDCAPlanBlockchainDto: CreateDCAPlanBlockchainDto,
    @CurrentUser() user: IUser,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const response = await this.dcaPlanService.createDCAPlanBlockchain(user, createDCAPlanBlockchainDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/:id/records')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get DCA plan execution records' })
  @ApiParam({ name: 'id', description: 'DCA plan ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Records per page', example: 10 })
  @ApiResponse({ status: 200, description: 'DCA plan records retrieved successfully' })
  @ApiResponse({ status: 404, description: 'DCA plan not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDCAPlanRecords(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const response = await this.dcaPlanService.getDCAPlanRecords(id, page, limit);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }
}
