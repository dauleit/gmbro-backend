import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: true, unique: true })
  symbol: string; // ETH, SOL, AVAX, MATIC

  @Prop({ required: true })
  name: string; // Ethereum, Solana, Avalanche, Polygon

  @Prop({ required: true, unique: true })
  contractAddress: string; // Smart contract address for the token

  @Prop({ required: true })
  currentPrice: number; // 2340.5, 98.75, 24.8, 0.87

  @Prop({ required: true })
  priceChange24h: number; // 5.2, -2.1, 8.7, 3.4

  @Prop({ required: true })
  priceChangePercentage24h: number; // Percentage change

  @Prop({ default: false })
  isVerified: boolean; // Checkmark status

  @Prop()
  iconUrl?: string; // URL to token icon

  @Prop()
  iconInitials?: string; // ET, SO, AV, MA

  @Prop({ type: [Number], default: [] })
  priceHistory: number[]; // Array of historical prices for chart

  @Prop({ type: [Date], default: [] })
  priceHistoryTimes: Date[]; // Corresponding times for price history

  @Prop({ default: true })
  isActive: boolean; // Whether token is active for trading

  @Prop({ default: false })
  isFeatured: boolean; // Whether token is featured/promoted

  @Prop({ default: 0 })
  marketCap: number; // Market capitalization

  @Prop({ default: 0 })
  volume24h: number; // 24-hour trading volume

  @Prop({ default: 0 })
  circulatingSupply: number; // Circulating supply

  @Prop()
  maxSupply?: number; // Maximum supply if applicable

  @Prop({ default: 'USD' })
  quoteCurrency: string; // Quote currency (USD, EUR, etc.)

  @Prop({ type: Object })
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
}

export const TokenSchema = SchemaFactory.createForClass(Token);
