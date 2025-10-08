export const CIRCLE_API_ENDPOINTS = {
  ENCRYPTION_KEY: '/v1/encryption/public',
  CARDS: '/v1/cards',
  CARD_DETAIL: '/v1/cards/',
  WALLETS: '/wallets',
  PAYMENTS: '/v1/payments'
};

export enum TransactionTypeEnum {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
  RECEIVE = 'RECEIVE',
  EXCHANGE = 'EXCHANGE',
  BUY = 'BUY',
  SELL = 'SELL',
  OTHER = 'OTHER'
}

export enum TRANSACTION_STATUS {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
