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
    USER_NOT_FOUND: {
      message: 'USER_NOT_FOUND',
      status: 400,
      code: 'USER_NOT_FOUND'
    },
    EMAIL_EXISTS: {
      message: 'EMAIL_EXISTS',
      status: 400,
      code: 'EMAIL_EXISTS'
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
  }
};
