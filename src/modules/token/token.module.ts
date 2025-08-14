import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { CoinGeckoService } from './coingecko.service';
import { Token, TokenSchema } from './schemas/token.schema';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../../configs/config.module';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    HttpModule,
    ScheduleModule.forRoot(),
    AuthModule,
    ConfigModule,
    UserModule,
    WalletModule
  ],
  controllers: [TokenController],
  providers: [TokenService, CoinGeckoService],
  exports: [TokenService]
})
export class TokenModule {}
