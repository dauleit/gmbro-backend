export interface ICircleCreateCardRequest {
  idempotencyKey: string;
  keyId: string;
  encryptedData: string;
  billingDetails: {
    name: string;
    country: string;
    city: string;
    line1: string;
    line2?: string;
    district: string;
    postalCode: string;
  };
  metadata: {
    email: string;
    phoneNumber: string;
    sessionId: string;
    ipAddress: string;
  };
}

export interface ICircleCreateCardResponse {
  data: {
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
  };
}
