import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { DCAPlanController } from './dca-plan.controller';
import { DCAPlanService } from './dca-plan.service';
import { DCAPlan, DCAPlanSchema } from './schemas/dca-plan.schema';
import { DCAPlanRecord, DCAPlanRecordSchema } from './schemas/dca-plan-record.schema';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { CircleService } from 'src/common/modules/circle/circle.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DCAPlan.name, schema: DCAPlanSchema },
      { name: DCAPlanRecord.name, schema: DCAPlanRecordSchema }
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    WalletModule
  ],
  controllers: [DCAPlanController],
  providers: [DCAPlanService, CircleService],
  exports: [DCAPlanService]
})
export class DCAPlanModule {}
