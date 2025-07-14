import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ConfigService } from 'src/configs/config.service';
import { User, UserDocument } from '../../user/schemas/user.schema';

@Injectable()
export class JWTService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>, private readonly configService: ConfigService) {}

  /**
   * Sign JWT token
   * @param payload JWT payload
   * @param options JWT options
   * @returns JWT token
   */
  async sign(payload: any, options?: jwt.SignOptions): Promise<string> {
    const secret = this.configService.get('JWT_SECRET') || 'your-secret-key';
    const expiresIn = options?.expiresIn || this.configService.get('JWT_EXPIRES_IN') || '1h';

    return jwt.sign(payload, secret, { ...options, expiresIn });
  }

  /**
   * Verify JWT token
   * @param token JWT token
   * @returns Decoded payload
   */
  async verify(token: string): Promise<any> {
    const secret = this.configService.get('JWT_SECRET') || 'your-secret-key';
    return jwt.verify(token, secret);
  }

  /**
   * Create access and refresh tokens
   * @param payload JWT payload
   * @returns Object with access and refresh tokens
   */
  async createToken(payload: any) {
    const accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET') || 'access-secret';
    const refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET') || 'refresh-secret';

    const accessTokenExpiresIn = this.configService.get('ACCESS_TOKEN_EXPIRATION') || '1h';
    const refreshTokenExpiresIn = this.configService.get('REFRESH_TOKEN_EXPIRATION') || '7d';

    const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: accessTokenExpiresIn });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: refreshTokenExpiresIn });

    return {
      accessToken,
      refreshToken
    };
  }

  /**
   * Validate user from JWT payload
   * @param signedUser JWT payload
   * @returns User object or null
   */
  async validateUser(signedUser: any): Promise<any> {
    try {
      const userFromDb = await this.userModel.findById(signedUser.sub || signedUser.id);
      return userFromDb || null;
    } catch (error) {
      return null;
    }
  }
}
