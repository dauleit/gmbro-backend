import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Controller, Logger, Post, Get, Put, Delete, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { QueryTokenDto } from './dto/query-token.dto';
import { FetchTokenDto } from './dto/fetch-token.dto';
import { BaseController } from '../../base/base-controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from '../../common/constants/enums';
import { ERROR_MESSAGES } from '../../common/constants/errorMessage';

@ApiTags('Tokens')
@Controller({
  path: '/tokens',
  version: '1'
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TokenController extends BaseController {
  private logger: Logger = new Logger('TokenController');

  constructor(private readonly tokenService: TokenService) {
    super();
  }

  @Post('/')
  @Roles(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Create a new token' })
  @ApiBody({ type: CreateTokenDto })
  @ApiResponse({ status: 201, description: 'Token created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - token already exists' })
  async create(@Body() createTokenDto: CreateTokenDto, @Res() res: Response) {
    try {
      const response = await this.tokenService.create(createTokenDto);
      return this.responseCreated(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all tokens with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Tokens retrieved successfully' })
  async findAll(@Query() query: QueryTokenDto, @Res() res: Response) {
    try {
      const response = await this.tokenService.findAll(query);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/top')
  @ApiOperation({ summary: 'Get top tokens by market cap' })
  @ApiQuery({ name: 'limit', description: 'Number of tokens to return (get all if not provided)', required: false })
  @ApiResponse({ status: 200, description: 'Top tokens retrieved successfully' })
  async getTopTokens(@Res() res: Response, @Query('limit') limit?: string) {
    try {
      const limitNumber = limit ? parseInt(limit) : undefined;
      const response = await this.tokenService.getTopTokens(limitNumber);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/trending')
  @ApiOperation({ summary: 'Get trending tokens by 24h price change' })
  @ApiQuery({ name: 'limit', description: 'Number of tokens to return (get all if not provided)', required: false })
  @ApiResponse({ status: 200, description: 'Trending tokens retrieved successfully' })
  async getTrendingTokens(@Res() res: Response, @Query('limit') limit?: string) {
    try {
      const limitNumber = limit ? parseInt(limit) : undefined;
      const response = await this.tokenService.getTrendingTokens(limitNumber);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/featured')
  @ApiOperation({ summary: 'Get featured tokens' })
  @ApiQuery({ name: 'limit', description: 'Number of tokens to return (get all if not provided)', required: false })
  @ApiResponse({ status: 200, description: 'Featured tokens retrieved successfully' })
  async getFeaturedTokens(@Res() res: Response, @Query('limit') limit?: string) {
    try {
      const limitNumber = limit ? parseInt(limit) : undefined;
      const response = await this.tokenService.getFeaturedTokens(limitNumber);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a token by ID' })
  @ApiParam({ name: 'id', description: 'Token ID' })
  @ApiResponse({ status: 200, description: 'Token retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const response = await this.tokenService.findOne(id);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/symbol/:symbol')
  @ApiOperation({ summary: 'Get a token by symbol' })
  @ApiParam({ name: 'symbol', description: 'Token symbol (e.g., BTC, ETH)' })
  @ApiResponse({ status: 200, description: 'Token retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async findBySymbol(@Param('symbol') symbol: string, @Res() res: Response) {
    try {
      const response = await this.tokenService.findBySymbol(symbol);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Put('/:id')
  @Roles(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Update a token' })
  @ApiParam({ name: 'id', description: 'Token ID' })
  @ApiBody({ type: UpdateTokenDto })
  @ApiResponse({ status: 200, description: 'Token updated successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async update(@Param('id') id: string, @Body() updateTokenDto: UpdateTokenDto, @Res() res: Response) {
    try {
      const response = await this.tokenService.update(id, updateTokenDto);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Delete('/:id')
  @Roles(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Delete a token' })
  @ApiParam({ name: 'id', description: 'Token ID' })
  @ApiResponse({ status: 200, description: 'Token deleted successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.tokenService.remove(id);
      return this.responseSuccess(res, { message: ERROR_MESSAGES.common.SUCCESSFUL, data: null });
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Post('/fetch-from-coingecko')
  @Roles(UserRoles.ADMIN)
  @ApiOperation({ summary: 'Fetch token data from CoinGecko and save to database' })
  @ApiBody({ type: FetchTokenDto })
  @ApiResponse({ status: 201, description: 'Token fetched and saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - token already exists or fetch failed' })
  async fetchFromCoinGecko(@Body() fetchTokenDto: FetchTokenDto, @Res() res: Response) {
    try {
      const response = await this.tokenService.fetchAndSaveTokenFromCoinGecko(fetchTokenDto.coinId, fetchTokenDto.contractAddress);
      return this.responseCreated(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('/:symbol/chart/:period?')
  @ApiOperation({ summary: 'Get token chart data for different periods' })
  @ApiParam({ name: 'symbol', description: 'Token symbol (e.g., BTC, ETH)' })
  @ApiParam({ name: 'period', description: 'Chart period (1h, 24h, 7d, 30d, 1y)', required: false })
  @ApiResponse({ status: 200, description: 'Chart data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async getChartData(@Res() res: Response, @Param('symbol') symbol: string, @Param('period') period?: string) {
    try {
      const response = await this.tokenService.getChartData(symbol, period);
      return this.responseSuccess(res, response);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }
}
