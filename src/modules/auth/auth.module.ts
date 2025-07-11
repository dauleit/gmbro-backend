import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { LoggerMiddleware } from '../../common/middlewares/middleware';

import { JwtStrategy } from './passport/jwt.strategy';

import { ConfigModule } from 'src/configs/config.module';
import { MailModule } from 'src/common/modules/mail/mail.module';

import { AuthService } from './auth.service';
import { JWTService } from './passport/jwt.service';

import { AuthController } from './auth.controller';
import { ConfigService } from 'src/configs/config.service';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([]), HttpModule, MailModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, JWTService, JwtStrategy, ConfigService],
  exports: [AuthService, JWTService, JwtStrategy]
})
export class AuthModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
