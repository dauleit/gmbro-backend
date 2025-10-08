export interface ICircleCard {
  id: string;
  cardId: string;
  walletId: string;
  cardProgramId?: string;
  fingerprint?: string;
  type: string;
  network: string;
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  email: string;
  phoneNumber: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    district: string;
    country: string;
    postalCode: string;
  };
  status: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
