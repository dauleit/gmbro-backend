export interface IToken {
  _id?: string;
  symbol: string;
  name: string;
  contractAddress: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  isVerified: boolean;
  iconUrl?: string;
  iconInitials?: string;
  priceHistory: number[];
  priceHistoryTimes: Date[];
  isActive: boolean;
  isFeatured: boolean;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  maxSupply?: number;
  quoteCurrency: string;
  metadata?: {
    website?: string;
    whitepaper?: string;
    description?: string;
    socialLinks?: {
      twitter?: string;
      telegram?: string;
      discord?: string;
      github?: string;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITokenPriceData {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  timestamp: Date;
}

export interface IPriceData {
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  timestamp: Date;
}

export interface ITokenChartData {
  symbol: string;
  prices: number[];
  times: Date[];
  period: string; // 1h, 24h, 7d, 30d, 1y
}
