import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  constructor(response?: string | Record<string, unknown>) {
    super(response || 'Not Found', HttpStatus.NOT_FOUND);
  }
}
