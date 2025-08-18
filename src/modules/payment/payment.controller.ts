import { Controller, Post, Get, Body, Param, Headers, RawBodyRequest, Req, UseGuards, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user';
import { JwtPayload } from '../auth/interfaces/jwtPayload.interface';
import { BaseController } from '../../base/base-controller';
import { ERROR_MESSAGES } from '../../common/constants/errorMessage';
import { IUser } from '../user/interfaces/user.interface';

@ApiTags('Payment')
@Controller({
  path: '/payment',
  version: '1'
})
export class PaymentController extends BaseController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService, private readonly stripeService: StripeService) {
    super();
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session for USDC deposit' })
  @ApiResponse({ status: 201, description: 'Checkout session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCheckoutSession(@Body() createCheckoutDto: CreateCheckoutDto, @CurrentUser() user: IUser, @Res() res: Response) {
    try {
      const result = await this.paymentService.createCheckoutSession(createCheckoutDto, user.id);
      return this.responseCreated(res, result);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Post('callback')
  @ApiOperation({ summary: 'Webhook endpoint to receive Stripe notifications' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Webhook signature verification failed' })
  async handleWebhook(@Req() request: RawBodyRequest<Request>, @Res() res: Response) {
    try {
      const signature = request.headers['stripe-signature'];
      const event = await this.stripeService.constructWebhookEvent(request.body, signature);
      const result = await this.paymentService.handleWebhookEvent(event);
      return this.responseSuccess(res, result);
    } catch (error) {
      this.logger.error('Webhook error:', error);

      if (error.message?.includes('No such webhook')) {
        return this.responseBadRequest(res, {
          message: ERROR_MESSAGES.common.BAD_REQUEST,
          data: { error: 'Invalid webhook signature' }
        });
      }

      return this.responseError(res, error.response);
    }
  }

  @Get('status/:paymentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check payment status or checkout session status' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment or session not found' })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment Intent ID (pi_xxx) or Checkout Session ID (cs_xxx)'
  })
  async getPaymentStatus(@Param('paymentId') paymentId: string, @Res() res: Response) {
    try {
      const result = await this.paymentService.getPaymentStatus(paymentId);
      return this.responseSuccess(res, result);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get USDC deposit transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactionHistory(@CurrentUser() user: JwtPayload, @Res() res: Response) {
    try {
      const result = await this.paymentService.getUserTransactions(user.email);
      return this.responseSuccess(res, result);
    } catch (error) {
      return this.responseError(res, error.response);
    }
  }
}
