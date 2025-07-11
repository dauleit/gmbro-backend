import { JWTService } from './passport/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';

interface JwtPayload {
  phoneCode: string;
  phoneNumber: string;
  otp: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY = '10m';

  constructor() {
    this.logger.log('AuthService constructor');
  }

  async checkIsExistedToken(token: string): Promise<boolean> {
    return true;
  }
}
