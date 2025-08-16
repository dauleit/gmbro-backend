import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { ConfigModule } from './configs/config.module';
import { ConfigService } from './configs/config.service';

import { AppSocketGateway } from './app.socket';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TokenModule } from './modules/token/token.module';
import { AwsModule } from './modules/aws/aws.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule,

    // Schedule Modules
    ScheduleModule.forRoot(),

    // MongoDB Connection Config
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.getMongoConfig()
    }),

    // Custom Modules
    AuthModule,
    UserModule,
    TokenModule,
    AwsModule,
    PaymentModule
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService, AppSocketGateway]
})
export class AppModule {}
