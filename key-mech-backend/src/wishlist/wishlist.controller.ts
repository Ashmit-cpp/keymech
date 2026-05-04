import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service.js';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto.js';
import { MergeGuestWishlistDto } from './dto/merge-guest-wishlist.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@Controller('wishlist')
@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get authenticated user wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist retrieved successfully' })
  async getWishlist(@CurrentUser() user: AuthenticatedUser) {
    return this.wishlistService.getWishlistByUserId(user.userId);
  }

  @Post('items')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Add an item to authenticated user wishlist' })
  @ApiBody({ type: CreateWishlistItemDto })
  @ApiResponse({
    status: 201,
    description: 'Item added to wishlist successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - item already exists or invalid data',
  })
  @ApiResponse({ status: 404, description: 'Product or variant not found' })
  async addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() item: CreateWishlistItemDto,
  ) {
    return this.wishlistService.addItem(user.userId, item);
  }

  @Delete('items/:wishlistItemId')
  @ApiOperation({ summary: 'Remove an item from authenticated user wishlist' })
  @ApiParam({ name: 'wishlistItemId', description: 'Wishlist item UUID' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  @ApiResponse({ status: 404, description: 'Wishlist item not found' })
  async removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('wishlistItemId') wishlistItemId: string,
  ) {
    return this.wishlistService.removeItem(user.userId, wishlistItemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear authenticated user wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist cleared successfully' })
  async clearWishlist(@CurrentUser() user: AuthenticatedUser) {
    return this.wishlistService.clearWishlist(user.userId);
  }

  @Post('merge')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Merge guest wishlist items into authenticated user wishlist',
  })
  @ApiBody({ type: MergeGuestWishlistDto })
  @ApiResponse({
    status: 200,
    description: 'Guest wishlist merged successfully',
  })
  async mergeGuestWishlist(
    @CurrentUser() user: AuthenticatedUser,
    @Body() mergeDto: MergeGuestWishlistDto,
  ) {
    return this.wishlistService.mergeGuestWishlistItems(
      user.userId,
      mergeDto.items,
    );
  }
}
