import { ConfigService } from './../../configs/config.service';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ICoinGeckoTokenResponse } from './interfaces/coingecko.interface';
import { ICoinGeckoRawResponse } from './interfaces/coingecko-raw.interface';
import { CreateTokenDto } from './dto/create-token.dto';

@Injectable()
export class CoinGeckoService {
  constructor(private readonly httpService: HttpService, private configService: ConfigService) {}

  async fetchTokenByContract(coinId: string, contractAddress: string): Promise<ICoinGeckoTokenResponse> {
    try {
      const url = `${this.configService.get('COINGECKO_API_URL')}/coins/${coinId}/contract/${contractAddress}`;
      const response = await firstValueFrom(this.httpService.get<ICoinGeckoRawResponse>(url));
      return this.transformToCamelCase(response.data);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 404) {
        throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to fetch token data from CoinGecko', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private transformToCamelCase(rawData: ICoinGeckoRawResponse): ICoinGeckoTokenResponse {
    return {
      id: rawData.id || '',
      symbol: rawData.symbol || '',
      name: rawData.name || '',
      webSlug: rawData.web_slug || '',
      assetPlatformId: rawData.asset_platform_id || '',
      platforms: rawData.platforms || {},
      detailPlatforms: Object.fromEntries(
        Object.entries(rawData.detail_platforms || {}).map(([key, value]) => [
          key,
          {
            decimalPlace: value?.decimal_place || 0,
            contractAddress: value?.contract_address || '',
            geckoterminalUrl: value?.geckoterminal_url || ''
          }
        ])
      ),
      blockTimeInMinutes: rawData.block_time_in_minutes || 0,
      hashingAlgorithm: rawData.hashing_algorithm || '',
      categories: rawData.categories || [],
      previewListing: rawData.preview_listing || false,
      publicNotice: rawData.public_notice || '',
      additionalNotices: rawData.additional_notices || [],
      localization: rawData.localization || {},
      description: rawData.description || { en: '' },
      links: {
        homepage: rawData.links?.homepage || [],
        blockchainSite: rawData.links?.blockchain_site || [],
        officialForumUrl: rawData.links?.official_forum_url || [],
        chatUrl: rawData.links?.chat_url || [],
        announcementUrl: rawData.links?.announcement_url || [],
        twitterScreenName: rawData.links?.twitter_screen_name || '',
        telegramChannelIdentifier: rawData.links?.telegram_channel_identifier || '',
        subredditUrl: rawData.links?.subreddit_url || '',
        reposUrl: {
          github: rawData.links?.repos_url?.github || [],
          bitbucket: rawData.links?.repos_url?.bitbucket || []
        }
      },
      image: rawData.image || { thumb: '', small: '', large: '' },
      countryOrigin: rawData.country_origin || '',
      genesisDate: rawData.genesis_date || '',
      sentimentVotesUpPercentage: rawData.sentiment_votes_up_percentage || 0,
      sentimentVotesDownPercentage: rawData.sentiment_votes_down_percentage || 0,
      watchlistPortfolioUsers: rawData.watchlist_portfolio_users || 0,
      marketCapRank: rawData.market_cap_rank || 0,
      marketData: {
        currentPrice: rawData.market_data?.current_price || {},
        totalValueLocked: rawData.market_data?.total_value_locked || null,
        mcapToTvlRatio: rawData.market_data?.mcap_to_tvl_ratio || null,
        fdvToTvlRatio: rawData.market_data?.fdv_to_tvl_ratio || null,
        roi: rawData.market_data?.roi || null,
        ath: rawData.market_data?.ath || {},
        athChangePercentage: rawData.market_data?.ath_change_percentage || {},
        athDate: rawData.market_data?.ath_date || {},
        atl: rawData.market_data?.atl || {},
        atlChangePercentage: rawData.market_data?.atl_change_percentage || {},
        atlDate: rawData.market_data?.atl_date || {},
        marketCap: rawData.market_data?.market_cap || {},
        marketCapRank: rawData.market_data?.market_cap_rank || 0,
        fullyDilutedValuation: rawData.market_data?.fully_diluted_valuation || {},
        marketCapFdvRatio: rawData.market_data?.market_cap_fdv_ratio || 0,
        totalVolume: rawData.market_data?.total_volume || {},
        high24h: rawData.market_data?.high_24h || {},
        low24h: rawData.market_data?.low_24h || {},
        priceChange24h: rawData.market_data?.price_change_24h || 0,
        priceChangePercentage24h: rawData.market_data?.price_change_percentage_24h || 0,
        priceChangePercentage7d: rawData.market_data?.price_change_percentage_7d || 0,
        priceChangePercentage30d: rawData.market_data?.price_change_percentage_30d || 0,
        priceChangePercentage60d: rawData.market_data?.price_change_percentage_60d || 0,
        priceChangePercentage200d: rawData.market_data?.price_change_percentage_200d || 0,
        priceChangePercentage1y: rawData.market_data?.price_change_percentage_1y || 0,
        priceChange24hInCurrency: rawData.market_data?.price_change_24h_in_currency || {},
        priceChangePercentage1hInCurrency: rawData.market_data?.price_change_percentage_1h_in_currency || {},
        priceChangePercentage24hInCurrency: rawData.market_data?.price_change_percentage_24h_in_currency || {},
        priceChangePercentage7dInCurrency: rawData.market_data?.price_change_percentage_7d_in_currency || {},
        priceChangePercentage30dInCurrency: rawData.market_data?.price_change_percentage_30d_in_currency || {},
        priceChangePercentage60dInCurrency: rawData.market_data?.price_change_percentage_60d_in_currency || {},
        priceChangePercentage200dInCurrency: rawData.market_data?.price_change_percentage_200d_in_currency || {},
        priceChangePercentage1yInCurrency: rawData.market_data?.price_change_percentage_1y_in_currency || {},
        marketCapChange24hInCurrency: rawData.market_data?.market_cap_change_24h_in_currency || {},
        marketCapChangePercentage24hInCurrency: rawData.market_data?.market_cap_change_percentage_24h_in_currency || {},
        totalSupply: rawData.market_data?.total_supply || 0,
        maxSupply: rawData.market_data?.max_supply || null,
        circulatingSupply: rawData.market_data?.circulating_supply || 0,
        lastUpdated: rawData.market_data?.last_updated || ''
      },
      communityData: {
        redditAveragePosts48h: rawData.community_data?.reddit_average_posts_48h || 0,
        redditAverageComments48h: rawData.community_data?.reddit_average_comments_48h || 0,
        redditSubscribers: rawData.community_data?.reddit_subscribers || 0,
        redditAccountsActive48h: rawData.community_data?.reddit_accounts_active_48h || 0,
        telegramChannelUserCount: rawData.community_data?.telegram_channel_user_count || 0,
        twitterFollowers: rawData.community_data?.twitter_followers || 0
      },
      developerData: {
        forks: rawData.developer_data?.forks || 0,
        stars: rawData.developer_data?.stars || 0,
        subscribers: rawData.developer_data?.subscribers || 0,
        totalIssues: rawData.developer_data?.total_issues || 0,
        closedIssues: rawData.developer_data?.closed_issues || 0,
        pullRequestsMerged: rawData.developer_data?.pull_requests_merged || 0,
        pullRequestContributors: rawData.developer_data?.pull_request_contributors || 0,
        codeAdditionsDeletions4Weeks: {
          additions: rawData.developer_data?.code_additions_deletions_4_weeks?.additions || 0,
          deletions: rawData.developer_data?.code_additions_deletions_4_weeks?.deletions || 0
        },
        commitCount4Weeks: rawData.developer_data?.commit_count_4_weeks || 0,
        last4WeeksCommitActivitySeries: rawData.developer_data?.last_4_weeks_commit_activity_series || []
      },
      publicInterestScore: rawData.public_interest_score || 0,
      publicInterestStats: {
        alexaRank: rawData.public_interest_stats?.alexa_rank || null,
        bingMatches: rawData.public_interest_stats?.bing_matches || null
      },
      statusUpdates: rawData.status_updates || [],
      lastUpdated: rawData.last_updated || '',
      tickers: (rawData.tickers || []).map((ticker) => ({
        base: ticker.base,
        target: ticker.target,
        market: {
          name: ticker.market?.name || '',
          identifier: ticker.market?.identifier || '',
          hasTradingIncentive: ticker.market?.has_trading_incentive || false
        },
        last: ticker.last || 0,
        volume: ticker.volume || 0,
        convertedLast: ticker.converted_last || {},
        convertedVolume: ticker.converted_volume || {},
        trustScore: ticker.trust_score || '',
        bidAskSpreadPercentage: ticker.bid_ask_spread_percentage || 0,
        timestamp: ticker.timestamp || '',
        lastTradedAt: ticker.last_traded_at || '',
        lastFetchAt: ticker.last_fetch_at || '',
        isAnomaly: ticker.is_anomaly || false,
        isStale: ticker.is_stale || false,
        tradeUrl: ticker.trade_url || '',
        tokenInfoUrl: ticker.token_info_url || null,
        coinId: ticker.coin_id || '',
        targetCoinId: ticker.target_coin_id || ''
      }))
    };
  }

  mapToCreateTokenDto(coingeckoData: ICoinGeckoTokenResponse): CreateTokenDto {
    const marketData = coingeckoData.marketData;
    const usdPrice = marketData.currentPrice.usd || 0;
    const usdPriceChange24h = marketData.priceChange24h || 0;
    const usdPriceChangePercentage24h = marketData.priceChangePercentage24h || 0;
    const usdMarketCap = marketData.marketCap.usd || 0;
    const usdVolume24h = marketData.totalVolume.usd || 0;

    // Extract icon initials from symbol
    const iconInitials = coingeckoData.symbol.toUpperCase().substring(0, 2);

    // Build metadata
    const metadata = {
      website: coingeckoData.links.homepage?.[0] || undefined,
      whitepaper: coingeckoData.links.blockchainSite?.[0] || undefined,
      description: coingeckoData.description.en || undefined,
      socialLinks: {
        twitter: coingeckoData.links.twitterScreenName ? `https://twitter.com/${coingeckoData.links.twitterScreenName}` : undefined,
        telegram: coingeckoData.links.telegramChannelIdentifier ? `https://t.me/${coingeckoData.links.telegramChannelIdentifier}` : undefined,
        github: coingeckoData.links.reposUrl?.github?.[0] || undefined
      }
    };

    return {
      symbol: coingeckoData.symbol.toUpperCase(),
      name: coingeckoData.name,
      contractAddress: '', // This will be set by the calling method
      currentPrice: usdPrice,
      priceChange24h: usdPriceChange24h,
      priceChangePercentage24h: usdPriceChangePercentage24h,
      isVerified: true, // CoinGecko tokens are generally verified
      iconUrl: coingeckoData.image.large,
      iconInitials,
      isActive: true,
      marketCap: usdMarketCap,
      volume24h: usdVolume24h,
      circulatingSupply: marketData.circulatingSupply || 0,
      maxSupply: marketData.maxSupply || undefined,
      quoteCurrency: 'USD',
      metadata
    };
  }

  async getTokenInfo(coinId: string, contractAddress: string): Promise<CreateTokenDto> {
    const coingeckoData = await this.fetchTokenByContract(coinId, contractAddress);
    const tokenDto = this.mapToCreateTokenDto(coingeckoData);
    tokenDto.contractAddress = contractAddress.toLowerCase();
    return tokenDto;
  }
}
