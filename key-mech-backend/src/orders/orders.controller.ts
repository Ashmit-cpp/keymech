import { Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { ParseUUIDPipe } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post(':userId')
  create(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.service.createOrder(userId);
  }

  @Get('user/:userId')
  findForUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.service.findOrdersForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }
}
