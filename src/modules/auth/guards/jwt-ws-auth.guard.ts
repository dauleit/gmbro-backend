import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { ConfigService } from 'src/configs/config.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const authToken = client.handshake.headers.authorization;
    const jwtPayload = jwt.verify(authToken, this.configService.get('ACCESS_TOKEN_SECRET'));
    return true;
    // const user: User = await this.validate(jwtPayload);

    // /**
    //  * Note if you need to access your user after the guard
    //  * Note: context.switchToWs().getData().user = user;
    //  */
    // client.handshake.query.user = user.toObject();

    // if (user && user?._id) {
    //   return true;
    // } else {
    //   throw new BadRequestException(errorMessage.auth.INVALID_TOKEN);
    // }
  }

  /**
   * Validate User
   * @param param0
   * @returns Promise<User>
   */
  private validate({ id }: any) {
    // return this.userService.validateUserById(id);
    return true;
  }
}
