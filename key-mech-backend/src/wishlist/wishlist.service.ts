import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
      throw new BadRequestException(
        'Either productId or variantId must be provided',
      );
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

  async isInWishlist(
    userId: string,
    productId?: string,
    variantId?: string,
  ): Promise<boolean> {
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
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }

    if (!guestItems || guestItems.length === 0) {
      return { message: 'No items to merge', addedItems: 0 };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingItems = await this.getWishlistByUserId(userId);
    const existingKeys = new Set(
      existingItems.map(
        (item) => `${item.productId ?? 'null'}:${item.variantId ?? 'null'}`,
      ),
    );

    const newItems = guestItems.filter((item) => {
      if (!item.productId && !item.variantId) {
        return false;
      }

      const key = `${item.productId ?? 'null'}:${item.variantId ?? 'null'}`;
      return !existingKeys.has(key);
    });

    if (newItems.length === 0) {
      return { message: 'No new items to merge', addedItems: 0 };
    }

    const productIds = [
      ...new Set(
        newItems
          .map((item) => item.productId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const variantIds = [
      ...new Set(
        newItems
          .map((item) => item.variantId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const [products, variants] = await Promise.all([
      this.prisma.product.findMany({ where: { id: { in: productIds } } }),
      this.prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
      }),
    ]);
    const validProductIds = new Set(products.map((product) => product.id));
    const validVariantIds = new Set(variants.map((variant) => variant.id));
    const validItems = newItems.filter(
      (item) =>
        (!item.productId || validProductIds.has(item.productId)) &&
        (!item.variantId || validVariantIds.has(item.variantId)),
    );

    if (validItems.length > 0) {
      await this.prisma.wishlist.createMany({
        data: validItems.map((item) => ({
          userId,
          productId: item.productId || null,
          variantId: item.variantId || null,
        })),
        skipDuplicates: true,
      });
    }

    return {
      message: 'Guest wishlist merged successfully',
      addedItems: validItems.length,
    };
  }
}
