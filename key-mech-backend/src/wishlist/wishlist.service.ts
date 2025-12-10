import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MergeGuestWishlistDto } from './dto/merge-guest-wishlist.dto.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto.js';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  private includeRelations = {
    product: true,
    variant: true,
  } satisfies Prisma.WishlistInclude;

  async getWishlistByUserId(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async addItem(userId: string, item: CreateWishlistItemDto) {
    // Validate that at least one of productId or variantId is provided
    if (!item.productId && !item.variantId) {
      throw new BadRequestException('Either productId or variantId must be provided');
    }

    // Check if item already exists in wishlist
    const existingItem = await this.prisma.wishlist.findFirst({
      where: {
        userId,
        productId: item.productId || null,
        variantId: item.variantId || null,
      },
    });

    if (existingItem) {
      throw new BadRequestException('Item already exists in wishlist');
    }

    // Verify that the product/variant exists
    if (item.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
    }

    if (item.variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: item.variantId },
      });
      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }
    }

    return this.prisma.wishlist.create({
      data: {
        userId,
        productId: item.productId || null,
        variantId: item.variantId || null,
      },
      include: this.includeRelations,
    });
  }

  async removeItem(userId: string, wishlistItemId: string) {
    const item = await this.prisma.wishlist.findFirst({
      where: {
        id: wishlistItemId,
        userId,
      },
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.prisma.wishlist.delete({
      where: { id: wishlistItemId },
    });

    return { message: 'Item removed from wishlist successfully' };
  }

  async clearWishlist(userId: string) {
    await this.prisma.wishlist.deleteMany({
      where: { userId },
    });

    return { message: 'Wishlist cleared successfully' };
  }

  async isInWishlist(userId: string, productId?: string, variantId?: string): Promise<boolean> {
    const count = await this.prisma.wishlist.count({
      where: {
        userId,
        productId: productId ? productId : null,
        variantId: variantId ? variantId : null,
      },
    });

    return count > 0;
  }

  async mergeGuestWishlistItems(
    userId: string,
    guestItems: { productId?: string; variantId?: string }[],
  ) {
    console.log('[WISHLIST] Starting mergeGuestWishlistItems:', { 
      userId, 
      itemCount: guestItems.length,
      items: JSON.stringify(guestItems)
    });

    if (!userId) {
      console.error('[WISHLIST] UserId is required');
      throw new BadRequestException('UserId is required');
    }

    if (!guestItems || guestItems.length === 0) {
      console.log('[WISHLIST] No items to merge');
      return { message: 'No items to merge', addedItems: 0 };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error('[WISHLIST] User not found:', userId);
      throw new NotFoundException('User not found');
    }

    // Get existing wishlist items
    const existingItems = await this.getWishlistByUserId(userId);
    console.log('[WISHLIST] User wishlist:', `Found ${existingItems.length} items`);

    // Create a set of existing item keys for quick lookup
    const existingKeys = new Set<string>();
    existingItems.forEach((item) => {
      const key = `${item.productId ?? 'null'}:${item.variantId ?? 'null'}`;
      existingKeys.add(key);
    });

    // Filter guest items to only include those not already in the user's wishlist
    const newItems = guestItems.filter((item) => {
      // Validate that at least one of productId or variantId is provided
      if (!item.productId && !item.variantId) {
        return false;
      }

      const key = `${item.productId ?? 'null'}:${item.variantId ?? 'null'}`;
      return !existingKeys.has(key);
    });

    console.log('[WISHLIST] New items to add:', newItems.length);

    if (newItems.length === 0) {
      return { message: 'No new items to merge' };
    }

    // Verify that products/variants exist before adding
    let addedCount = 0;
    for (const item of newItems) {
      let shouldSkip = false;

      // Validate productId if provided
      if (item.productId) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          console.warn('[WISHLIST] Product not found during merge:', item.productId);
          shouldSkip = true;
        }
      }

      // Validate variantId if provided
      if (item.variantId && !shouldSkip) {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (!variant) {
          console.warn('[WISHLIST] Product variant not found during merge:', item.variantId);
          shouldSkip = true;
        }
      }

      // Skip if validation failed
      if (shouldSkip) {
        continue;
      }

      // Add the item to the wishlist
      try {
        await this.prisma.wishlist.create({
          data: {
            userId,
            productId: item.productId || null,
            variantId: item.variantId || null,
          },
        });
        addedCount++;
      } catch (error) {
        console.error('[WISHLIST] Error creating wishlist item:', error);
      }
    }

    console.log('[WISHLIST] Successfully merged guest wishlist items. Added:', addedCount);
    return { message: 'Guest wishlist merged successfully', addedItems: addedCount };
  }
}