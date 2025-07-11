import { Model, ObjectId } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { IUser } from '../../user/interfaces/user.interface';
import { ConfigService } from 'src/configs/config.service';

@Injectable()
export class JWTService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>, private readonly configService: ConfigService) {}

  /**
   *
   * @param id ObjectId | string
   * @param email string
   * @param roles string[]
   * @returns Object
   */
  async createToken(payload: any) {
    const accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    const refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');

    const accessTokenExpiresIn = this.configService.get('ACCESS_TOKEN_EXPIRATION');
    const refreshTokenExpiresIn = this.configService.get('REFRESH_TOKEN_EXPIRATION');
    const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: accessTokenExpiresIn });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: refreshTokenExpiresIn });

    return {
      accessToken,
      refreshToken
    };
  }

  /**
   *
   * @param signedUser
   * @returns
   */
  async validateUser(signedUser): Promise<IUser> {
    const userFromDb = await this.userModel.findById(signedUser.id);

    if (userFromDb) {
      return userFromDb;
    }
    return null;
  }
}
