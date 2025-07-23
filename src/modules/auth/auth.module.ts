import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { LoggerMiddleware } from '../../common/middlewares/middleware';

import { JwtStrategy } from './passport/jwt.strategy';

import { ConfigModule } from 'src/configs/config.module';
import { MailModule } from 'src/common/modules/mail/mail.module';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/schemas/user.schema';
import { WalletModule } from '../wallet/wallet.module';

import { AuthService } from './auth.service';
import { JWTService } from './passport/jwt.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

import { AuthController } from './auth.controller';
import { ConfigService } from 'src/configs/config.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
    MailModule,
    ConfigModule,
    forwardRef(() => UserModule),
    forwardRef(() => WalletModule)
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTService, JwtStrategy, ConfigService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JWTService, JwtStrategy, JwtAuthGuard, RolesGuard]
})
export class AuthModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController);
  }
}
