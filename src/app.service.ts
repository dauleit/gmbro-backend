import { Injectable } from '@nestjs/common';
import { ConfigService } from './configs/config.service';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getWelcome(): any {
    return { message: 'Welcome to Orange Cleaning API server v1' };
  }
}
