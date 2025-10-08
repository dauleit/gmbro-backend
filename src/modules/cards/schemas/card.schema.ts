import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

mongoose.set('debug', false);

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true, unique: true })
  circleCardId: string;

  @Prop({ required: true })
  cardType: string; // 'credit', 'debit'

  @Prop({ required: true })
  cardNetwork: string; // 'visa', 'mastercard', 'amex', etc.

  @Prop({ required: true })
  lastFourDigits: string; // 4 số cuối của card

  @Prop({ required: true })
  expiryMonth: number; // 1-12

  @Prop({ required: true })
  expiryYear: number; // 2024, 2025, etc.

  @Prop({ required: true })
  cardholderName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ type: Object })
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    district: string;
    country: string;
    postalCode: string;
  };

  @Prop({ required: true, default: 'active' })
  status: string; // 'active', 'inactive', 'expired', 'suspended'

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: Object })
  circleMetadata: {
    cardId: string;
    walletId: string;
    cardProgramId?: string;
    fingerprint?: string;
  };

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const CardSchema = SchemaFactory.createForClass(Card);

// Indexes
CardSchema.index({ user: 1 });
CardSchema.index({ circleCardId: 1 }, { unique: true });
CardSchema.index({ user: 1, isDefault: 1 });
CardSchema.index({ user: 1, status: 1 });
CardSchema.index({ lastFourDigits: 1 });
CardSchema.index({ expiryYear: 1, expiryMonth: 1 });
CardSchema.index({ createdAt: -1 });
