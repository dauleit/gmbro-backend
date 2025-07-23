export interface ICoinGeckoTokenResponse {
  id: string;
  symbol: string;
  name: string;
  webSlug: string;
  assetPlatformId: string;
  platforms: Record<string, string>;
  detailPlatforms: Record<
    string,
    {
      decimalPlace: number;
      contractAddress: string;
      geckoterminalUrl: string;
    }
  >;
  blockTimeInMinutes: number;
  hashingAlgorithm: string | null;
  categories: string[];
  previewListing: boolean;
  publicNotice: string;
  additionalNotices: string[];
  localization: Record<string, string>;
  description: Record<string, string>;
  links: {
    homepage: string[];
    blockchainSite: string[];
    officialForumUrl: string[];
    chatUrl: string[];
    announcementUrl: string[];
    twitterScreenName: string;
    telegramChannelIdentifier: string;
    subredditUrl: string;
    reposUrl: {
      github: string[];
      bitbucket: string[];
    };
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  countryOrigin: string;
  genesisDate: string;
  sentimentVotesUpPercentage: number;
  sentimentVotesDownPercentage: number;
  watchlistPortfolioUsers: number;
  marketCapRank: number;
  marketData: {
    currentPrice: Record<string, number>;
    totalValueLocked: Record<string, number> | null;
    mcapToTvlRatio: number | null;
    fdvToTvlRatio: number | null;
    roi: {
      currency: string;
      percentage: number;
      times: number;
    } | null;
    ath: Record<string, number>;
    athChangePercentage: Record<string, number>;
    athDate: Record<string, string>;
    atl: Record<string, number>;
    atlChangePercentage: Record<string, number>;
    atlDate: Record<string, string>;
    marketCap: Record<string, number>;
    marketCapRank: number;
    fullyDilutedValuation: Record<string, number>;
    marketCapFdvRatio: number;
    totalVolume: Record<string, number>;
    high24h: Record<string, number>;
    low24h: Record<string, number>;
    priceChange24h: number;
    priceChangePercentage24h: number;
    priceChangePercentage7d: number;
    priceChangePercentage30d: number;
    priceChangePercentage60d: number;
    priceChangePercentage200d: number;
    priceChangePercentage1y: number;
    priceChange24hInCurrency: Record<string, number>;
    priceChangePercentage1hInCurrency: Record<string, number>;
    priceChangePercentage24hInCurrency: Record<string, number>;
    priceChangePercentage7dInCurrency: Record<string, number>;
    priceChangePercentage30dInCurrency: Record<string, number>;
    priceChangePercentage60dInCurrency: Record<string, number>;
    priceChangePercentage200dInCurrency: Record<string, number>;
    priceChangePercentage1yInCurrency: Record<string, number>;
    marketCapChange24hInCurrency: Record<string, number>;
    marketCapChangePercentage24hInCurrency: Record<string, number>;
    totalSupply: number;
    maxSupply: number | null;
    circulatingSupply: number;
    lastUpdated: string;
  };
  communityData: {
    redditAveragePosts48h: number;
    redditAverageComments48h: number;
    redditSubscribers: number;
    redditAccountsActive48h: number;
    telegramChannelUserCount: number;
    twitterFollowers: number;
  };
  developerData: {
    forks: number;
    stars: number;
    subscribers: number;
    totalIssues: number;
    closedIssues: number;
    pullRequestsMerged: number;
    pullRequestContributors: number;
    codeAdditionsDeletions4Weeks: {
      additions: number;
      deletions: number;
    };
    commitCount4Weeks: number;
    last4WeeksCommitActivitySeries: number[];
  };
  publicInterestScore: number;
  publicInterestStats: {
    alexaRank: number | null;
    bingMatches: number | null;
  };
  statusUpdates: any[];
  lastUpdated: string;
  tickers: Array<{
    base: string;
    target: string;
    market: {
      name: string;
      identifier: string;
      hasTradingIncentive: boolean;
    };
    last: number;
    volume: number;
    convertedLast: Record<string, number>;
    convertedVolume: Record<string, number>;
    trustScore: string;
    bidAskSpreadPercentage: number;
    timestamp: string;
    lastTradedAt: string;
    lastFetchAt: string;
    isAnomaly: boolean;
    isStale: boolean;
    tradeUrl: string;
    tokenInfoUrl: string | null;
    coinId: string;
    targetCoinId: string;
  }>;
}
