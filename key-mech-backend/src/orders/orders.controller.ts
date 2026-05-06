import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';
import { RazorpayOrderResponseDto } from './dto/razorpay-order-response.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { OrderResponseDto } from './dto/order-response.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

@Controller('orders')
@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get orders for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of current user orders',
    type: [OrderResponseDto],
  })
  findForCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findOrdersForUser(user.userId);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get all orders for admins' })
  @ApiResponse({
    status: 200,
    description: 'List of all orders',
    type: [OrderResponseDto],
  })
  findAllForAdmin(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAllForAdmin(user);
  }

  @Patch('admin/:id/status')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update an order status as admin' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Order status updated',
    type: OrderResponseDto,
  })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.service.updateStatusForAdmin(user, id, dto.status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an owned order by ID, or any order as admin' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({
    status: 200,
    description: 'Order found',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.service.findOneForUser(user, id);
  }

  @Post('payment/create-razorpay-order')
  @ApiOperation({ summary: 'Create a Razorpay order for payment' })
  @ApiResponse({
    status: 201,
    description: 'Razorpay order created successfully',
    type: RazorpayOrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createRazorpayOrder(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RazorpayOrderResponseDto> {
    return this.service.createRazorpayOrder(user.userId);
  }

  @Post('payment/verify')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Verify payment and create order' })
  @ApiBody({ type: VerifyPaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment verified and order created',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Payment verification failed' })
  async verifyPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.service.verifyAndCreateOrder(user.userId, dto);
  }
}
