import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service.js';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto.js';
import { MergeGuestWishlistDto } from './dto/merge-guest-wishlist.dto.js';

interface RequestWithUser {
  user?: { userId: string; email: string };
}

@Controller('wishlist')
@ApiTags('wishlist')
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  private getUserId(req: RequestWithUser): string {
    if (!req.user?.userId) {
      throw new Error('User is not authenticated');
    }
    return req.user.userId;
  }

  @Get()
  @ApiOperation({ summary: 'Get authenticated user wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist retrieved successfully' })
  async getWishlist(@Req() req: RequestWithUser) {
    const userId = this.getUserId(req);
    console.log('[WISHLIST] Getting wishlist for user:', userId);
    return this.wishlistService.getWishlistByUserId(userId);
  }

  @Post('items')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Add an item to authenticated user wishlist' })
  @ApiResponse({ status: 201, description: 'Item added to wishlist successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - item already exists or invalid data' })
  @ApiResponse({ status: 404, description: 'Product or variant not found' })
  async addItem(
    @Req() req: RequestWithUser,
    @Body() item: CreateWishlistItemDto,
  ) {
    const userId = this.getUserId(req);
    console.log('[WISHLIST] Adding item to wishlist for user:', userId);
    return this.wishlistService.addItem(userId, item);
  }

  @Delete('items/:wishlistItemId')
  @ApiOperation({ summary: 'Remove an item from authenticated user wishlist' })
  @ApiParam({ name: 'wishlistItemId', description: 'Wishlist item UUID' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  @ApiResponse({ status: 404, description: 'Wishlist item not found' })
  async removeItem(
    @Req() req: RequestWithUser,
    @Param('wishlistItemId') wishlistItemId: string,
  ) {
    const userId = this.getUserId(req);
    console.log('[WISHLIST] Removing item from wishlist for user:', userId);
    return this.wishlistService.removeItem(userId, wishlistItemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear authenticated user wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist cleared successfully' })
  async clearWishlist(@Req() req: RequestWithUser) {
    const userId = this.getUserId(req);
    console.log('[WISHLIST] Clearing wishlist for user:', userId);
    return this.wishlistService.clearWishlist(userId);
  }

  @Post('merge')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Merge guest wishlist items into authenticated user wishlist' })
  @ApiResponse({ status: 200, description: 'Guest wishlist merged successfully' })
  async mergeGuestWishlist(
    @Req() req: RequestWithUser,
    @Body() mergeDto: MergeGuestWishlistDto,
  ) {
    const userId = this.getUserId(req);

    if (!userId) {
      throw new Error('User is not authenticated');
    }

    console.log('[WISHLIST] Merging guest wishlist for user:', userId, 'Items:', mergeDto.items.length);
    
    try {
      return await this.wishlistService.mergeGuestWishlistItems(userId, mergeDto.items);
    } catch (error) {
      console.error('[WISHLIST] Error merging guest wishlist:', error);
      throw error;
    }
  }
}