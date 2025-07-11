import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger: Logger = new Logger('LoggerMiddleware');

  use(req: any, res: Response, next: any) {
    try {
      const obfuscateRequest = JSON.parse(JSON.stringify(req.body));

      if (obfuscateRequest && obfuscateRequest.password) {
        obfuscateRequest.password = '*******';
      }

      if (obfuscateRequest && obfuscateRequest.newPassword) {
        obfuscateRequest.newPassword = '*******';
      }

      if (obfuscateRequest && obfuscateRequest.currentPassword) {
        obfuscateRequest.currentPassword = '*******';
      }

      if (obfuscateRequest != null) {
        this.logger.log(new Date().toString() + ' - [Request] ' + req.baseUrl + ' - ' + JSON.stringify(obfuscateRequest));
      }
    } catch (error) {
      this.logger.log(new Date().toString() + ' - [Request] ' + req.baseUrl + ' - ' + JSON.stringify(error));
    }

    next();
  }
}
