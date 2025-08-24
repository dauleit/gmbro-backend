import { JWTService } from './passport/jwt.service';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from 'src/configs/config.service';
import { SocialLoginDto, SocialProvider, TelegramLoginDto, XLoginDto, GmailLoginDto } from './dto/social-login.dto';
import { SocialUser, TelegramUser, XUser, GmailUser } from './interfaces/socialUser.interface';
import { UserService } from '../user/user.service';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';
import { circleUserSdk } from 'src/common/modules/circle/circle.service';
import { WalletService } from '../wallet/wallet.service';
import { OAuth2Client } from 'google-auth-library';
import { UnauthorizedException } from 'src/common/exceptions/unauthorized.exception';

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

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JWTService,
    private readonly userService: UserService,
    private readonly walletService: WalletService
  ) {
    this.logger.log('AuthService constructor');
  }

  async checkIsExistedToken(token: string): Promise<boolean> {
    return true;
  }

  async findUserById(userId: string) {
    return await this.userService.findOneById(userId);
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    this.logger.log(`Social login attempt with provider: ${socialLoginDto.provider}`);

    let socialUser: SocialUser;

    switch (socialLoginDto.provider) {
      case SocialProvider.TELEGRAM:
        socialUser = await this.validateTelegramLogin(socialLoginDto.data as TelegramLoginDto);
        break;

      case SocialProvider.X:
        const xData = socialLoginDto.data as XLoginDto;
        socialUser = await this.validateXLogin(xData.code);
        break;

      case SocialProvider.GMAIL:
        const gmailData = socialLoginDto.data as GmailLoginDto;
        socialUser = await this.validateGmailLogin(gmailData);
        break;

      default:
        throw new Error(`Unsupported social provider: ${socialLoginDto.provider}`);
    }

    // Save or update user in database
    const user = await this.saveOrUpdateUser(socialUser);

    // Generate JWT tokens using jwtService
    const tokens = await this.jwtService.createToken({
      sub: user._id.toString(),
      provider: user.provider,
      providerId: user.providerId
    });

    const result = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 3600, // 1 hour
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        provider: user.provider,
        providerId: user.providerId
      }
    };

    return {
      message: ERROR_MESSAGES.common.SUCCESSFUL,
      data: result
    };
  }

  async validateTelegramLogin(telegramData: TelegramUser): Promise<SocialUser> {
    try {
      // Verify Telegram data hash
      const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
      if (!botToken) {
        throw new BadRequestException('Telegram bot token not configured');
      }

      const dataCheckString = Object.keys(telegramData)
        .filter((key) => key !== 'hash')
        .sort()
        .map((key) => `${key}=${telegramData[key]}`)
        .join('\n');

      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
      const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      if (hash !== telegramData.hash) {
        throw new UnauthorizedException({
          message: ERROR_MESSAGES.auth.INVALID_TELEGRAM_DATA_HASH
        });
      }

      // Check if authDate is not too old (within 1 hour)
      const authDate = parseInt(telegramData.authDate);
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime - authDate > 3600) {
        throw new UnauthorizedException({
          message: ERROR_MESSAGES.auth.TELEGRAM_AUTH_DATA_EXPIRED
        });
      }

      return {
        id: telegramData.id,
        firstName: telegramData.firstName,
        lastName: telegramData.lastName,
        avatar: telegramData.photoUrl,
        provider: SocialProvider.TELEGRAM,
        providerId: telegramData.id
      };
    } catch (error) {
      this.logger.error('Telegram validation failed:', error);
      throw error;
    }
  }

  async validateXLogin(code: string): Promise<SocialUser> {
    try {
      const clientId = this.configService.get('X_CLIENT_ID');
      const clientSecret = this.configService.get('X_CLIENT_SECRET');
      const redirectUri = this.configService.get('X_REDIRECT_URI');

      if (!clientId || !clientSecret || !redirectUri) {
        throw new BadRequestException('X (Twitter) OAuth credentials not configured');
      }

      // Exchange code for access token
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          'https://api.twitter.com/2/oauth2/token',
          {
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: 'challenge' // You should implement PKCE properly
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            }
          }
        )
      );

      const accessToken = tokenResponse.data.access_token;

      // Get user information
      const userResponse = await firstValueFrom(
        this.httpService.get('https://api.twitter.com/2/users/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      );

      const userData: XUser = userResponse.data.data;

      return {
        id: userData.id,
        email: userData.email,
        firstName: userData.name,
        avatar: userData.profileImageUrl,
        provider: SocialProvider.X,
        providerId: userData.id
      };
    } catch (error) {
      this.logger.error('X (Twitter) validation failed:', error);
      throw new UnauthorizedException({
        message: ERROR_MESSAGES.common.UNAUTHORIZED_ACCESS_DENIED
      });
    }
  }

  async validateGmailLogin(gmailData: GmailLoginDto): Promise<SocialUser> {
    try {
      const { accessToken, idToken, userInfo } = gmailData;

      // Validate access token by making a request to Google API
      try {
        if (accessToken) {
          const userResponse = await firstValueFrom(
            this.httpService.get('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            })
          );
          // Verify that the user info matches what was provided
          const googleUserData = userResponse.data;
          if (googleUserData.id !== userInfo.id || googleUserData.email !== userInfo.email) {
            throw new UnauthorizedException({
              message: ERROR_MESSAGES.auth.INVALID_GOOGLE_USER_INFO
            });
          }
        }
        if (idToken) {
          const client = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
          const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: this.configService.get('GOOGLE_CLIENT_ID')
          });
          const payload = ticket.getPayload();
          if (payload.sub !== userInfo.id || payload.email !== userInfo.email) {
            throw new UnauthorizedException({
              message: ERROR_MESSAGES.auth.INVALID_GOOGLE_USER_INFO
            });
          }
        }
      } catch (error) {
        this.logger.error('Google token validation failed:', error);
        throw new UnauthorizedException({
          message: ERROR_MESSAGES.auth.INVALID_GOOGLE_ACCESS_TOKEN
        });
      }

      return {
        id: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.givenName,
        lastName: userInfo.familyName,
        avatar: userInfo.picture,
        provider: SocialProvider.GMAIL,
        providerId: userInfo.id
      };
    } catch (error) {
      this.logger.error('Gmail validation failed:', error);
      throw error;
    }
  }

  private async saveOrUpdateUser(socialUser: SocialUser) {
    try {
      // Check if user exists by provider and providerId
      const existingUser = await this.userService.findByProvider(socialUser.provider, socialUser.providerId);

      if (existingUser) {
        // Update existing user with new information and last login
        await this.userService.updateLastLogin(existingUser._id.toString());

        // Update user info if needed (avatar, email, etc.)
        const updateData: any = {};
        const userWallet = await this.walletService.findByUser(existingUser._id.toString());
        if (!userWallet) {
          const circleUserId = crypto.randomUUID();
          await circleUserSdk.createUser({ userId: circleUserId });
          const circleUserToken = await circleUserSdk.createUserToken({ userId: circleUserId });
          const userToken = circleUserToken.data.userToken;
          const encryptionKey = circleUserToken.data.encryptionKey;

          updateData.circleUserId = circleUserId;
          updateData.circleUserToken = userToken;
          updateData.circleUserEncryptionKey = encryptionKey;
        }

        if (socialUser.avatar && socialUser.avatar !== existingUser.avatar) {
          updateData.avatar = socialUser.avatar;
        }
        if (socialUser.email && socialUser.email !== existingUser.email) {
          updateData.email = socialUser.email;
        }
        if (socialUser.lastName && socialUser.lastName !== existingUser.lastName) {
          updateData.lastName = socialUser.lastName;
        }

        if (Object.keys(updateData).length > 0) {
          return await this.userService.update(existingUser._id.toString(), updateData);
        }

        return existingUser;
      }
      const circleUserId = crypto.randomUUID();
      await circleUserSdk.createUser({ userId: circleUserId });
      const circleUserToken = await circleUserSdk.createUserToken({ userId: circleUserId });
      const userToken = circleUserToken.data.userToken;
      const encryptionKey = circleUserToken.data.encryptionKey;

      // Create new user
      const createUserDto = {
        firstName: socialUser.firstName,
        lastName: socialUser.lastName,
        email: socialUser.email,
        avatar: socialUser.avatar,
        provider: socialUser.provider,
        providerId: socialUser.providerId,
        roles: ['user'],
        isActive: true,
        circleUserId: circleUserId,
        circleUserToken: userToken,
        circleUserEncryptionKey: encryptionKey,
        metadata: {
          socialProvider: socialUser.provider,
          socialProviderId: socialUser.providerId,
          createdAt: new Date().toISOString()
        }
      };

      const newUser = await this.userService.create(createUserDto);
      this.logger.log(`New user created from social login: ${newUser._id}`);
      return newUser;
    } catch (error) {
      this.logger.error('Error saving/updating user:', error);
      throw new Error('Failed to save user information');
    }
  }
}
