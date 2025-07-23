import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';
import { ConfigService } from 'src/configs/config.service';

const configService = new ConfigService();
export const circleUserSdk = initiateUserControlledWalletsClient({
  apiKey: configService.get('CIRCLE_API_KEY'),
  baseUrl: configService.get('CIRCLE_API_BASE_URL'),
  userAgent: configService.get('CIRCLE_USER_AGENT')
});
