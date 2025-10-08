import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './schemas/card.schema';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CircleService } from 'src/common/modules/circle/circle.service';
import { ConfigModule } from 'src/configs/config.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]), UserModule, AuthModule, ConfigModule],
  controllers: [CardsController],
  providers: [CardsService, CircleService],
  exports: [CardsService]
})
export class CardsModule {}
