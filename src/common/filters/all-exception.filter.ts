import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger, HttpException } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger: Logger = new Logger('AllExceptionsFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    this.logger.warn('Exception: ', JSON.stringify(exception));

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(exception?.response ?? exception);
  }
}
