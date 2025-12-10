import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
  ValidationPipe,
  Req,
  Res,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { CartService } from './cart.service.js';
import { CreateCartItemDto } from './dto/create-cart-item.dto.js';
import { MergeGuestCartDto } from './dto/merge-guest-cart.dto.js';

interface RequestWithUser extends Request {
  user?: { userId: string; email: string };
}

@Controller('cart')
@ApiTags('cart')
@ApiBearerAuth()
export class CartController {
  constructor(private readonly service: CartService) {}

  private getUserId(req: RequestWithUser): string | undefined {
    return req.user?.userId;
  }

  @Post('items')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Add an item to authenticated user cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  async addItem(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Body() item: CreateCartItemDto,
  ) {
    const userId = this.getUserId(req);

    if (userId) {
      console.log('[CART] Adding item to authenticated user cart:', userId);
      const cart = await this.service.getOrCreateCartByUserId(userId);
      return this.service.addItemByCartId(cart.id, item, userId);
    }
    throw new Error('User is not authenticated');
  }

  @Get()
  @ApiOperation({ summary: 'Get authenticated user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-guest-cart-id') guestCartId: string | undefined,
  ) {
    const userId = this.getUserId(req);

    if (userId) {
      try {
        return await this.service.getCartByUser(userId);
      } catch (error) {
        // If user cart doesn't exist, create one
        console.log('[CART] User cart not found, creating new one');
        return this.service.getOrCreateCartByUserId(userId);
      }
    }

    // Guest user flow
    const cartId = guestCartId || randomUUID();
    res.setHeader('x-guest-cart-id', cartId);
    return this.service.getOrCreateGuestCart(cartId);
  }

  @Delete('items/:cartItemId')
  @ApiOperation({ summary: 'Remove an item from authenticated user cart' })
  @ApiParam({ name: 'cartItemId', description: 'Cart item UUID' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  async removeItem(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Param('cartItemId', new ParseUUIDPipe()) cartItemId: string,
  ) {
    const userId = this.getUserId(req);

    if (userId) {
      console.log('[CART] Removing item from authenticated user cart:', userId);
      const cart = await this.service.getCartByUser(userId);
      return this.service.removeItem(cart.id, cartItemId);
    }

    throw new Error('User is not authenticated');
  }

  @Delete()
  @ApiOperation({ summary: 'Clear authenticated user cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = this.getUserId(req);

    if (userId) {
      console.log('[CART] Clearing authenticated user cart:', userId);
      const cart = await this.service.getCartByUser(userId);
      return this.service.clearCart(cart.id);
    }

    throw new Error('User is not authenticated');
  }

  @Post('merge')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Merge guest cart items into authenticated user cart' })
  @ApiResponse({ status: 200, description: 'Guest cart merged successfully' })
  async mergeGuestCart(
    @Req() req: RequestWithUser,
    @Body() mergeDto: MergeGuestCartDto,
  ) {
    const userId = this.getUserId(req);

    if (!userId) {
      throw new Error('User is not authenticated');
    }

    console.log('[CART] Merging guest cart for user:', userId);
    return this.service.mergeGuestCartItems(userId, mergeDto.items);
  }
}
