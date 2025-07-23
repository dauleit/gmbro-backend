import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTService } from './jwt.service';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';

interface JwtPayload {
  sub: string; // userId
  provider: string;
  providerId: string;
  timestamp: number;
  iat?: number;
  exp?: number;
}

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
   * Validate JWT token with new payload structure
   * @param payload - JWT payload containing userId, provider, providerId, timestamp
   * @param req - Request object
   * @param done - Passport done callback
   * @returns User object if valid
   */
  public async validate(payload: JwtPayload, req: any, done: any) {
    try {
      // Validate required fields
      if (!payload.sub || !payload.provider || !payload.providerId || !payload.timestamp) {
        return done(
          new UnauthorizedException({
            message: ERROR_MESSAGES.auth.INVALID_TOKEN
          }),
          false
        );
      }

      // Check if token is expired (additional check)
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && currentTime > payload.exp) {
        return done(
          new UnauthorizedException({
            message: ERROR_MESSAGES.auth.TOKEN_EXPIRED
          }),
          false
        );
      }

      // Get user from database using userId
      const user = await this.authService.findUserById(payload.sub);
      if (!user) {
        return done(
          new UnauthorizedException({
            message: ERROR_MESSAGES.auth.USER_NOT_FOUND
          }),
          false
        );
      }

      // Validate provider and providerId match
      if (user.provider !== payload.provider || user.providerId !== payload.providerId) {
        return done(
          new UnauthorizedException({
            message: ERROR_MESSAGES.auth.INVALID_TOKEN
          }),
          false
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return done(
          new UnauthorizedException({
            message: ERROR_MESSAGES.auth.USER_INACTIVE
          }),
          false
        );
      }

      done(null, user);
    } catch (error) {
      return done(
        new UnauthorizedException({
          message: ERROR_MESSAGES.auth.INVALID_TOKEN
        }),
        false
      );
    }
  }
}
