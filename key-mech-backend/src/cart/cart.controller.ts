import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { CreateCartItemDto } from './dto/create-cart-item.dto.js';
import { CreateCartDto } from './dto/create-cart.dto.js';


@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateCartDto) {
    return this.service.createCart(dto);
  }

  @Post(':userId/items')
  @UsePipes(new ValidationPipe({ transform: true }))
  addItem(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() item: CreateCartItemDto,
  ) {
    return this.service.addItem(userId, item);
  }

  @Get(':userId')
  getCart(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.service.getCartByUser(userId);
  }

  @Delete('items/:cartItemId')
  removeItem(@Param('cartItemId', new ParseUUIDPipe()) cartItemId: string) {
    return this.service.removeItem(cartItemId);
  }

  @Delete(':userId')
  clearCart(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.service.clearCart(userId);
  }
}
