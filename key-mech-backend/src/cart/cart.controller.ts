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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { CartService } from './cart.service.js';
import { AddGarageBuildToCartDto } from './dto/add-garage-build-to-cart.dto.js';
import { CartResponseDto } from './dto/cart-response.dto.js';
import { CreateCartItemDto } from './dto/create-cart-item.dto.js';
import { MergeGuestCartDto } from './dto/merge-guest-cart.dto.js';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard.js';
import { AuthenticatedUser } from '../auth/current-user.decorator.js';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Controller('cart')
@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  constructor(private readonly service: CartService) {}

  private getUserId(req: RequestWithUser): string | undefined {
    return req.user?.userId;
  }

  @Post('items')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Add an item to authenticated user cart' })
  @ApiBody({ type: CreateCartItemDto })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully',
    type: CartResponseDto,
  })
  async addItem(@Req() req: RequestWithUser, @Body() item: CreateCartItemDto) {
    const userId = this.getUserId(req);

    if (userId) {
      const cart = await this.service.getOrCreateCartByUserId(userId);
      return this.service.addItemByCartId(cart.id, item, userId);
    }
    throw new UnauthorizedException('User is not authenticated');
  }

  @Post('garage-builds')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Add a Garage build bundle to authenticated user cart',
  })
  @ApiBody({ type: AddGarageBuildToCartDto })
  @ApiResponse({
    status: 201,
    description: 'Garage build bundle added to cart successfully',
    type: CartResponseDto,
  })
  async addGarageBuild(
    @Req() req: RequestWithUser,
    @Body() item: AddGarageBuildToCartDto,
  ) {
    const userId = this.getUserId(req);

    if (userId) {
      return this.service.addGarageBuildByUserId(userId, item);
    }
    throw new UnauthorizedException('User is not authenticated');
  }

  @Get()
  @ApiOperation({ summary: 'Get authenticated user cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
    type: CartResponseDto,
  })
  async getCart(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-guest-cart-id') guestCartId: string | undefined,
  ) {
    const userId = this.getUserId(req);

    if (userId) {
      try {
        return await this.service.getCartByUser(userId);
      } catch {
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
  @ApiResponse({
    status: 200,
    description: 'Item removed successfully',
    type: CartResponseDto,
  })
  async removeItem(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Param('cartItemId', new ParseUUIDPipe()) cartItemId: string,
  ) {
    const userId = this.getUserId(req);

    if (userId) {
      const cart = await this.service.getCartByUser(userId);
      return this.service.removeItem(cart.id, cartItemId);
    }

    throw new UnauthorizedException('User is not authenticated');
  }

  @Delete()
  @ApiOperation({ summary: 'Clear authenticated user cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
    type: CartResponseDto,
  })
  async clearCart(@Req() req: RequestWithUser) {
    const userId = this.getUserId(req);

    if (userId) {
      const cart = await this.service.getCartByUser(userId);
      return this.service.clearCart(cart.id);
    }

    throw new UnauthorizedException('User is not authenticated');
  }

  @Post('merge')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Merge guest cart items into authenticated user cart',
  })
  @ApiBody({ type: MergeGuestCartDto })
  @ApiResponse({
    status: 200,
    description: 'Guest cart merged successfully',
    type: CartResponseDto,
  })
  async mergeGuestCart(
    @Req() req: RequestWithUser,
    @Body() mergeDto: MergeGuestCartDto,
  ) {
    const userId = this.getUserId(req);

    if (!userId) {
      throw new UnauthorizedException('User is not authenticated');
    }

    return this.service.mergeGuestCartItems(userId, mergeDto.items);
  }
}
