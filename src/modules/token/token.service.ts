import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Token, TokenDocument } from './schemas/token.schema';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { QueryTokenDto } from './dto/query-token.dto';
import { IToken, ITokenPriceData } from './interfaces/token.interface';
import { CoinGeckoService } from './coingecko.service';
import { IResponseData } from '../../base/base-controller';
import { ERROR_MESSAGES } from '../../common/constants/errorMessage';

@Injectable()
export class TokenService {
  constructor(@InjectModel(Token.name) private tokenModel: Model<TokenDocument>, private readonly coinGeckoService: CoinGeckoService) {}

  async create(createTokenDto: CreateTokenDto): Promise<IResponseData> {
    const existingToken = await this.tokenModel.findOne({
      $or: [{ symbol: createTokenDto.symbol.toUpperCase() }, { contractAddress: createTokenDto.contractAddress.toLowerCase() }]
    });

    if (existingToken) {
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }

    const token = new this.tokenModel({
      ...createTokenDto,
      symbol: createTokenDto.symbol.toUpperCase()
    });

    const savedToken = await token.save();
    return {
      message: ERROR_MESSAGES.common.CREATED,
      data: { token: this.mapToResponse(savedToken) }
    };
  }

  async findAll(query: QueryTokenDto): Promise<IResponseData> {
    const { symbol, name, page = 1, limit = 10 } = query;

    const filter: any = {};

    if (symbol) {
      filter.symbol = { $regex: symbol.toUpperCase(), $options: 'i' };
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [tokens, total] = await Promise.all([this.tokenModel.find(filter).sort('-1').skip(skip).limit(limit).exec(), this.tokenModel.countDocuments(filter)]);

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: {
        tokens: tokens.map((token) => this.mapToResponse(token)),
        total,
        page,
        limit
      }
    };
  }

  async findOne(id: string): Promise<IResponseData> {
    const token = await this.tokenModel.findById(id).exec();
    if (!token) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.common.NOT_FOUND
      });
    }
    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { token: this.mapToResponse(token) }
    };
  }

  async findBySymbol(symbol: string): Promise<IResponseData> {
    const token = await this.tokenModel
      .findOne({
        symbol: symbol.toUpperCase()
      })
      .exec();

    if (!token) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.common.NOT_FOUND
      });
    }
    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { token: this.mapToResponse(token) }
    };
  }

  async update(id: string, updateTokenDto: UpdateTokenDto): Promise<IResponseData> {
    if (updateTokenDto.symbol) {
      updateTokenDto.symbol = updateTokenDto.symbol.toUpperCase();
    }

    const token = await this.tokenModel.findByIdAndUpdate(id, updateTokenDto, { new: true }).exec();

    if (!token) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.common.NOT_FOUND
      });
    }

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { token: this.mapToResponse(token) }
    };
  }

  async remove(id: string): Promise<void> {
    const token = await this.tokenModel.findByIdAndDelete(id).exec();
    if (!token) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.common.NOT_FOUND
      });
    }
  }

  async updatePriceData(symbol: string, priceData: ITokenPriceData): Promise<IResponseData> {
    const token = await this.tokenModel
      .findOne({
        symbol: symbol.toUpperCase()
      })
      .exec();

    if (!token) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.common.NOT_FOUND
      });
    }

    // Update price data
    token.currentPrice = priceData.currentPrice;
    token.priceChange24h = priceData.priceChange24h;
    token.priceChangePercentage24h = priceData.priceChangePercentage24h;
    token.marketCap = priceData.marketCap;
    token.volume24h = priceData.volume24h;

    // Add to price history (keep last 1000 entries)
    token.priceHistory.push(priceData.currentPrice);
    token.priceHistoryTimes.push(priceData.timestamp);

    if (token.priceHistory.length > 1000) {
      token.priceHistory = token.priceHistory.slice(-1000);
      token.priceHistoryTimes = token.priceHistoryTimes.slice(-1000);
    }

    const updatedToken = await token.save();
    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { token: this.mapToResponse(updatedToken) }
    };
  }

  async getChartData(symbol: string, period = '24h'): Promise<IResponseData> {
    const token = await this.tokenModel
      .findOne({
        symbol: symbol.toUpperCase()
      })
      .exec();

    if (!token) {
      throw new NotFoundException({
        message: ERROR_MESSAGES.common.NOT_FOUND
      });
    }

    // Filter data based on period
    const now = new Date();
    let filteredPrices: number[] = [];
    let filteredTimes: Date[] = [];

    switch (period) {
      case '1h':
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        filteredPrices = token.priceHistory.filter((_, index) => token.priceHistoryTimes[index] >= oneHourAgo);
        filteredTimes = token.priceHistoryTimes.filter((time) => time >= oneHourAgo);
        break;
      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredPrices = token.priceHistory.filter((_, index) => token.priceHistoryTimes[index] >= sevenDaysAgo);
        filteredTimes = token.priceHistoryTimes.filter((time) => time >= sevenDaysAgo);
        break;
      case '30d':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredPrices = token.priceHistory.filter((_, index) => token.priceHistoryTimes[index] >= thirtyDaysAgo);
        filteredTimes = token.priceHistoryTimes.filter((time) => time >= thirtyDaysAgo);
        break;
      case '1y':
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredPrices = token.priceHistory.filter((_, index) => token.priceHistoryTimes[index] >= oneYearAgo);
        filteredTimes = token.priceHistoryTimes.filter((time) => time >= oneYearAgo);
        break;
      default: // 24h
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filteredPrices = token.priceHistory.filter((_, index) => token.priceHistoryTimes[index] >= oneDayAgo);
        filteredTimes = token.priceHistoryTimes.filter((time) => time >= oneDayAgo);
        break;
    }

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: {
        symbol: token.symbol,
        prices: filteredPrices,
        times: filteredTimes,
        period
      }
    };
  }

  async getTopTokens(limit?: number): Promise<IResponseData> {
    const query = this.tokenModel.find({ isActive: true }).sort({ marketCap: -1 });

    if (limit) {
      query.limit(limit);
    }

    const tokens = await query.exec();

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { tokens: tokens.map((token) => this.mapToResponse(token)) }
    };
  }

  async getTrendingTokens(limit?: number): Promise<IResponseData> {
    const query = this.tokenModel.find({ isActive: true }).sort({ priceChangePercentage24h: -1 });

    if (limit) {
      query.limit(limit);
    }

    const tokens = await query.exec();

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { tokens: tokens.map((token) => this.mapToResponse(token)) }
    };
  }

  async getFeaturedTokens(limit?: number): Promise<IResponseData> {
    const query = this.tokenModel.find({ isActive: true, isFeatured: true }).sort({ marketCap: -1 });

    if (limit) {
      query.limit(limit);
    }

    const tokens = await query.exec();

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: { tokens: tokens.map((token) => this.mapToResponse(token)) }
    };
  }

  async fetchAndSaveTokenFromCoinGecko(coinId: string, contractAddress: string): Promise<IResponseData> {
    try {
      // Check if token already exists by contract address
      const existingToken = await this.tokenModel.findOne({
        contractAddress: contractAddress.toLowerCase()
      });

      if (existingToken) {
        throw new BadRequestException({
          message: ERROR_MESSAGES.common.BAD_REQUEST
        });
      }

      // Fetch token data from CoinGecko
      const tokenData = await this.coinGeckoService.getTokenInfo(coinId, contractAddress);
      // Create token in database
      const token = new this.tokenModel({
        ...tokenData,
        symbol: tokenData.symbol.toUpperCase(),
        contractAddress: contractAddress.toLowerCase()
      });

      const savedToken = await token.save();
      return {
        message: ERROR_MESSAGES.common.CREATED,
        data: { token: this.mapToResponse(savedToken) }
      };
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        message: ERROR_MESSAGES.common.BAD_REQUEST
      });
    }
  }

  async updateAllTokenPrices(): Promise<void> {
    try {
      const tokens = await this.tokenModel.find({ isActive: true }).exec();

      for (const token of tokens) {
        try {
          // Get price data from CoinGecko using contract address or symbol
          const priceData = await this.coinGeckoService.getPriceData(token.contractAddress || token.symbol);

          if (priceData) {
            await this.updatePriceData(token.symbol, {
              symbol: token.symbol,
              currentPrice: priceData.currentPrice,
              priceChange24h: priceData.priceChange24h,
              priceChangePercentage24h: priceData.priceChangePercentage24h,
              marketCap: priceData.marketCap,
              volume24h: priceData.volume24h,
              timestamp: priceData.timestamp
            });
          }
        } catch (error) {
          console.error(`Error updating price for token ${token.symbol}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in updateAllTokenPrices:', error);
    }
  }

  private mapToResponse(token: TokenDocument): IToken {
    return {
      _id: token._id.toString(),
      symbol: token.symbol,
      name: token.name,
      contractAddress: token.contractAddress,
      currentPrice: token.currentPrice,
      priceChange24h: token.priceChange24h,
      priceChangePercentage24h: token.priceChangePercentage24h,
      isVerified: token.isVerified,
      iconUrl: token.iconUrl,
      iconInitials: token.iconInitials,
      priceHistory: token.priceHistory,
      priceHistoryTimes: token.priceHistoryTimes,
      isActive: token.isActive,
      isFeatured: token.isFeatured,
      marketCap: token.marketCap,
      volume24h: token.volume24h,
      circulatingSupply: token.circulatingSupply,
      maxSupply: token.maxSupply,
      quoteCurrency: token.quoteCurrency,
      metadata: token.metadata,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt
    };
  }

  // Cron job: Run every 5 minutes
  @Cron('0 * * * *')
  async updateTokenPricesCron() {
    console.log('Updating token prices cron job');
    await this.updateAllTokenPrices();
  }

  // Cron job: Run every hour for more comprehensive updates
  @Cron(CronExpression.EVERY_HOUR)
  async comprehensiveTokenUpdateCron() {
    // You can add additional logic here for hourly updates
    // Like updating token metadata, verifying contracts, etc.
  }
}
