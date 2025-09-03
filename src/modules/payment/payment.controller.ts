import { Controller, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { BaseController } from '../../base/base-controller';

@ApiTags('Payment')
@Controller({
  path: '/payment',
  version: '1'
})
export class PaymentController extends BaseController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {
    super();
  }
}
