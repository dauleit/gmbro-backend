import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger, HttpException } from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/errorMessage';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private logger: Logger = new Logger('AllExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = { ...ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR, data: null };

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      // Check if exception has custom response format
      const exceptionResponse = (exception as any).getResponse ? (exception as any).getResponse() : null;
      if (exceptionResponse && typeof exceptionResponse === 'object' && exceptionResponse.message) {
        // Use custom response format from exception
        message = exceptionResponse;
      } else {
        // Handle specific HTTP exceptions
        switch (status) {
          case HttpStatus.BAD_REQUEST:
            message = { ...ERROR_MESSAGES.common.BAD_REQUEST, data: null };
            break;
          case HttpStatus.UNAUTHORIZED:
            message = { ...ERROR_MESSAGES.common.UNAUTHORIZED_ACCESS_DENIED, data: null };
            break;
          case HttpStatus.FORBIDDEN:
            message = { ...ERROR_MESSAGES.common.FORBIDDEN, data: null };
            break;
          case HttpStatus.NOT_FOUND:
            message = { ...ERROR_MESSAGES.common.NOT_FOUND, data: null };
            break;
          default:
            message = {
              ...ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR,
              data: null
            };
        }
      }
    } else {
      // Handle non-HTTP exceptions
      message = {
        ...ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR,
        data: null
      };
    }
    console.log(message);
    // Format response to match BaseController format
    const errorResponse = {
      ...message,
      data: message.data || null
    };

    response.status(status).json(errorResponse);
  }
}
