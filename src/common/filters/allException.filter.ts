import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger, HttpException } from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/errorMessage';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private logger: Logger = new Logger('AllExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    this.logger.warn('Exception: ', JSON.stringify(exception));

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      // Handle specific HTTP exceptions
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          message = ERROR_MESSAGES.common.BAD_REQUEST;
          break;
        case HttpStatus.UNAUTHORIZED:
          message = ERROR_MESSAGES.common.UNAUTHORIZED_ACCESS_DENIED;
          break;
        case HttpStatus.FORBIDDEN:
          message = ERROR_MESSAGES.common.FORBIDDEN;
          break;
        case HttpStatus.NOT_FOUND:
          message = ERROR_MESSAGES.common.NOT_FOUND;
          break;
        default:
          message = {
            message: exception.message || 'An error occurred',
            status: status,
            code: 'HTTP_EXCEPTION'
          };
      }
    } else {
      // Handle non-HTTP exceptions
      message = {
        message: exception.message || 'Internal server error',
        status: status,
        code: 'INTERNAL_ERROR'
      };
    }

    // Format response to match BaseController format
    const errorResponse = {
      message: message.message,
      status: message.status,
      code: message.code,
      data: null
    };

    response.status(status).json(errorResponse);
  }
}
