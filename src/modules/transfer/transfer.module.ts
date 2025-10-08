import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { Transfer, TransferSchema } from './schemas/transfer.schema';
import { CircleService } from 'src/common/modules/circle/circle.service';
import { WalletModule } from '../wallet/wallet.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from 'src/configs/config.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Transfer.name, schema: TransferSchema }]), WalletModule, AuthModule, ConfigModule],
  controllers: [TransferController],
  providers: [TransferService, CircleService],
  exports: [TransferService]
})
export class TransferModule {}
