import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTService } from './jwt.service';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { ERROR_MESSAGES } from 'src/common/constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwtService: JWTService, private readonly authService: AuthService) {
    super({
      passReqToCallback: true,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  /**
   *
   * @param payload
   * @param req
   * @param done
   * @returns
   */
  public async validate(payload: any, req: any, done: any) {
    const token = payload.headers.authorization.split('Bearer ')[1] || null;
    if (!token) {
      return done(
        new UnauthorizedException({
          message: ERROR_MESSAGES.auth.INVALID_TOKEN
        }),
        false
      );
    }
    // const isTokenExisted = await this.authService.checkIsExistedToken(token);
    // if (!isTokenExisted) {
    //   return done(
    //     new UnauthorizedException({
    //       message: errorMessage.auth.INVALID_TOKEN
    //     }),
    //     false
    //   );
    // }
    const user = await this.jwtService.validateUser(req);
    if (!user) {
      return done(new UnauthorizedException(), false);
    }
    done(null, user);
  }
}
