import { ConfigService } from 'src/configs/config.service';
import { AWSLib } from './aws';
import { AWS_TOKEN } from './aws.constant';

export const AWSProvider = {
  inject: [ConfigService],
  provide: AWS_TOKEN,
  useFactory: async (configService: ConfigService) => {
    const config = {
      AWS_REGION: '',
      AWS_SES_REGION: '',
      AWS_ACCESS_KEY_ID: '',
      AWS_SECRET_ACCESS_KEY: '',
      AWS_PUBLIC_BUCKET: '',
      AWS_PRIVATE_BUCKET: ''
    };
    const useInstanceRole = configService.get('USE_INSTANCE_ROLE') === 'true';

    return new AWSLib(config, useInstanceRole);
  }
};
