export const ERROR_MESSAGES = {
  common: {
    UNAUTHORIZED_ACCESS_DENIED: {
      message: 'UNAUTHORIZED_ACCESS_DENIED',
      status: 401,
      code: 'UNAUTHORIZED_ACCESS_DENIED'
    },
    FORBIDDEN: {
      message: 'FORBIDDEN',
      status: 403,
      code: 'FORBIDDEN'
    },
    BAD_REQUEST: {
      message: 'BAD_REQUEST',
      status: 400,
      code: 'BAD_REQUEST'
    },
    NOT_FOUND: {
      message: 'NOT_FOUND',
      status: 404,
      code: 'NOT_FOUND'
    },
    INTERNAL_SERVER_ERROR: {
      message: 'INTERNAL_SERVER_ERROR',
      status: 500,
      code: 'INTERNAL_SERVER_ERROR'
    },
    SUCCESSFUL: {
      message: 'SUCCESSFUL',
      status: 200,
      code: 'SUCCESSFUL'
    },
    PERMISSION_DENIED: {
      message: 'PERMISSION_DENIED',
      status: 403,
      code: 'PERMISSION_DENIED'
    },
    CREATED: {
      message: 'CREATED',
      status: 201,
      code: 'CREATED'
    }
  },
  auth: {
    INVALID_CREDENTIALS: {
      message: 'INVALID_CREDENTIALS',
      status: 400,
      code: 'INVALID_CREDENTIALS'
    },
    INVALID_TOKEN: {
      message: 'INVALID_TOKEN',
      status: 401,
      code: 'INVALID_TOKEN'
    },
    TOKEN_EXPIRED: {
      message: 'TOKEN_EXPIRED',
      status: 401,
      code: 'TOKEN_EXPIRED'
    },
    USER_NOT_FOUND: {
      message: 'USER_NOT_FOUND',
      status: 400,
      code: 'USER_NOT_FOUND'
    },
    USER_INACTIVE: {
      message: 'USER_INACTIVE',
      status: 401,
      code: 'USER_INACTIVE'
    },
    EMAIL_EXISTS: {
      message: 'EMAIL_EXISTS',
      status: 400,
      code: 'EMAIL_EXISTS'
    },
    INVALID_GOOGLE_USER_INFO: {
      message: 'INVALID_GOOGLE_USER_INFO',
      status: 401,
      code: 'INVALID_GOOGLE_USER_INFO'
    },
    INVALID_GOOGLE_ACCESS_TOKEN: {
      message: 'INVALID_GOOGLE_ACCESS_TOKEN',
      status: 401,
      code: 'INVALID_GOOGLE_ACCESS_TOKEN'
    },
    TELEGRAM_AUTH_DATA_EXPIRED: {
      message: 'TELEGRAM_AUTH_DATA_EXPIRED',
      status: 401,
      code: 'TELEGRAM_AUTH_DATA_EXPIRED'
    },
    INVALID_TELEGRAM_DATA_HASH: {
      message: 'INVALID_TELEGRAM_DATA_HASH',
      status: 401,
      code: 'INVALID_TELEGRAM_DATA_HASH'
    }
  },
  user: {
    USER_NOT_FOUND: {
      message: 'USER_NOT_FOUND',
      status: 400,
      code: 'USER_NOT_FOUND'
    },
    CREATE_USER_FAILED: {
      message: 'CREATE_USER_FAILED',
      status: 400,
      code: 'CREATE_USER_FAILED'
    },
    USER_ALREADY_EXISTS: {
      message: 'USER_ALREADY_EXISTS',
      status: 400,
      code: 'USER_ALREADY_EXISTS'
    },
    USER_CREATE_FAILED: {
      message: 'USER_CREATE_FAILED',
      status: 400,
      code: 'USER_CREATE_FAILED'
    },
    USER_ALREADY_VERIFIED: {
      message: 'USER_ALREADY_VERIFIED',
      status: 400,
      code: 'USER_ALREADY_VERIFIED'
    }
  },
  wallet: {
    USER_ALREADY_HAS_WALLET: {
      message: 'USER_ALREADY_HAS_WALLET',
      status: 400,
      code: 'USER_ALREADY_HAS_WALLET'
    },
    WALLET_NOT_FOUND: {
      message: 'WALLET_NOT_FOUND',
      status: 404,
      code: 'WALLET_NOT_FOUND'
    },
    CREATE_WALLET_FAILED: {
      message: 'CREATE_WALLET_FAILED',
      status: 400,
      code: 'CREATE_WALLET_FAILED'
    },
    WALLET_IS_EXISTED: {
      message: 'WALLET_IS_EXISTED',
      status: 400,
      code: 'WALLET_IS_EXISTED'
    },
    WALLET_IS_NOT_CREATED: {
      message: 'WALLET_IS_NOT_CREATED',
      status: 400,
      code: 'WALLET_IS_NOT_CREATED'
    },
    WALLET_NOT_FOUND_IN_CIRCLE: {
      message: 'WALLET_NOT_FOUND_IN_CIRCLE',
      status: 404,
      code: 'WALLET_NOT_FOUND_IN_CIRCLE'
    },
    REFRESH_BALANCE_FAILED: {
      message: 'REFRESH_BALANCE_FAILED',
      status: 500,
      code: 'REFRESH_BALANCE_FAILED'
    },
    GET_BALANCE_FAILED: {
      message: 'GET_BALANCE_FAILED',
      status: 500,
      code: 'GET_BALANCE_FAILED'
    },
    GET_TRANSACTIONS_FAILED: {
      message: 'GET_TRANSACTIONS_FAILED',
      status: 500,
      code: 'GET_TRANSACTIONS_FAILED'
    },
    GET_WALLET_DETAILS_FAILED: {
      message: 'GET_WALLET_DETAILS_FAILED',
      status: 500,
      code: 'GET_WALLET_DETAILS_FAILED'
    }
  }
};
