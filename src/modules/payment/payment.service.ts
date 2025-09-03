import { Injectable, Logger } from '@nestjs/common';
import { CircleService } from './circle.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly circleService: CircleService) {}
}
