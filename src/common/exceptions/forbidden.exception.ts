import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/errorMessage';

export class ForbiddenException extends HttpException {
  constructor(message = ERROR_MESSAGES.common.FORBIDDEN) {
    super(message, HttpStatus.FORBIDDEN);
  }
}
