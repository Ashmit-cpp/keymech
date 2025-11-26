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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service.js';
import { CreateCartItemDto } from './dto/create-cart-item.dto.js';
import { CreateCartDto } from './dto/create-cart.dto.js';


@Controller('cart')
@ApiTags('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new cart' })
  @ApiResponse({ status: 201, description: 'Cart created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() dto: CreateCartDto) {
    return this.service.createCart(dto);
  }

  @Post(':userId/items')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Add an item to user cart' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  addItem(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() item: CreateCartItemDto,
  ) {
    return this.service.addItem(userId, item);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get cart for a user' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User cart retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getCart(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.service.getCartByUser(userId);
  }

  @Delete('items/:cartItemId')
  @ApiOperation({ summary: 'Remove an item from cart' })
  @ApiParam({ name: 'cartItemId', description: 'Cart item UUID' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  removeItem(@Param('cartItemId', new ParseUUIDPipe()) cartItemId: string) {
    return this.service.removeItem(cartItemId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Clear user cart' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  clearCart(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.service.clearCart(userId);
  }
}
