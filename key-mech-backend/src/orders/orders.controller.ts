import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { ParseUUIDPipe } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';
import { RazorpayOrderResponseDto } from './dto/razorpay-order-response.dto.js';

@Controller('orders')
@ApiTags('orders')
export class OrdersController {
  constructor(
    private readonly service: OrdersService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Create a new order for a user' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  create(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.service.createOrder(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all orders for a user' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findForUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.service.findOrdersForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Post('payment/create-razorpay-order')
  @ApiOperation({ summary: 'Create a Razorpay order for payment' })
  @ApiBody({ type: CreateRazorpayOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Razorpay order created successfully',
    type: RazorpayOrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createRazorpayOrder(
    @Body() dto: CreateRazorpayOrderDto,
  ): Promise<RazorpayOrderResponseDto> {
    return this.service.createRazorpayOrder(dto.userId);
  }

  @Post('payment/verify')
  @ApiOperation({ summary: 'Verify payment and create order' })
  @ApiBody({ type: VerifyPaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment verified and order created',
  })
  @ApiResponse({ status: 400, description: 'Payment verification failed' })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.service.verifyAndCreateOrder(dto);
  }
}
