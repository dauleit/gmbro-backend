import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]), AuthModule, WalletModule, UserModule],
  controllers: [PaymentController],
  providers: [PaymentService, StripeService],
  exports: [PaymentService, StripeService]
})
export class PaymentModule {}
