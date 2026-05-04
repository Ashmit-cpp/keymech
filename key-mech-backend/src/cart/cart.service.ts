import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCartItemDto } from './dto/create-cart-item.dto.js';
import { CreateCartDto } from './dto/create-cart.dto.js';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private includeItems = {
    items: { include: { product: true, variant: true } },
  } satisfies Prisma.CartInclude;

  private toMergeKey(item: { productId: string; variantId?: string | null }) {
    return `${item.productId}:${item.variantId ?? 'null'}`;
  }

  private mergeCartItems(
    ...itemGroups: (
      | { productId: string; variantId?: string | null; quantity: number }[]
      | undefined
    )[]
  ) {
    const map = new Map<string, number>();

    itemGroups.forEach((items) => {
      items?.forEach((item) => {
        const key = this.toMergeKey(item);
        map.set(key, (map.get(key) ?? 0) + item.quantity);
      });
    });

    return Array.from(map.entries()).map(([key, quantity]) => {
      const [productId, variantId] = key.split(':');
      return {
        productId,
        variantId: variantId === 'null' ? null : variantId,
        quantity,
      };
    });
  }

  private async getOrCreateCartById(cartId: string, userId?: string | null) {
    let cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: this.includeItems,
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          id: cartId,
          userId: userId ?? undefined,
        } as Prisma.CartUncheckedCreateInput,
        include: this.includeItems,
      });
    }
    return cart;
  }

  private async getOrCreateCartByUser(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: this.includeItems,
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: this.includeItems,
      });
    }
    return cart;
  }

  async getOrCreateCartByUserId(userId: string) {
    return this.getOrCreateCartByUser(userId);
  }

  async getOrCreateGuestCart(cartId: string) {
    return this.getOrCreateCartById(cartId, null);
  }

  async createCart(dto: CreateCartDto) {
    if (!dto.userId) {
      return this.prisma.cart.create({
        data: {
          user: undefined,
          items: {
            create: dto.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId ?? null,
              quantity: i.quantity,
            })),
          },
        } as unknown as Prisma.CartCreateInput,
        include: this.includeItems,
      });
    }

    const cart = await this.getOrCreateCartByUser(dto.userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: {
          create: dto.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? null,
            quantity: i.quantity,
          })),
        },
      },
      include: this.includeItems,
    });
  }

  async addItemByCartId(
    cartId: string,
    item: CreateCartItemDto,
    userId?: string | null,
  ) {
    const cart = await this.getOrCreateCartById(cartId, userId ?? undefined);
    const existing = cart.items.find(
      (ci) =>
        ci.productId === item.productId &&
        ci.variantId === (item.variantId ?? null),
    );
    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
      return this.getCartById(cart.id);
    }
    await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
      },
    });
    return this.getCartById(cart.id);
  }

  async getCartById(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: this.includeItems,
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  async getCartByUser(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: this.includeItems,
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  async removeItem(cartId: string, cartItemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });
    if (!item || item.cartId !== cartId) {
      throw new NotFoundException('Cart item not found');
    }
    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    return this.getCartById(cartId);
  }

  async clearCart(cartId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) throw new NotFoundException('Cart not found');
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
    return this.getCartById(cartId);
  }

  async mergeCarts(guestCartId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const guestCart = await this.prisma.cart.findUnique({
      where: { id: guestCartId },
      include: { items: true },
    });

    const userCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!guestCart && !userCart) {
      return this.getOrCreateCartByUser(userId);
    }

    const mergedItems = this.mergeCartItems(guestCart?.items, userCart?.items);

    const targetCart =
      userCart ??
      (await this.prisma.cart.create({
        data: { userId },
        include: { items: true },
      }));

    await this.prisma.cartItem.deleteMany({ where: { cartId: targetCart.id } });

    if (mergedItems.length > 0) {
      await this.prisma.cartItem.createMany({
        data: mergedItems.map((item) => ({ cartId: targetCart.id, ...item })),
      });
    }

    if (guestCart && guestCart.id !== targetCart.id) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: guestCart.id },
      });
      await this.prisma.cart.delete({ where: { id: guestCart.id } });
    }

    if (!targetCart.userId) {
      await this.prisma.cart.update({
        where: { id: targetCart.id },
        data: { userId },
      });
    }

    return this.getCartById(targetCart.id);
  }

  async mergeGuestCartItems(
    userId: string,
    guestItems: { productId: string; variantId?: string; quantity: number }[],
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userCart = await this.getOrCreateCartByUser(userId);
    const mergedItems = this.mergeCartItems(userCart.items, guestItems);

    await this.prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });

    if (mergedItems.length > 0) {
      await this.prisma.cartItem.createMany({
        data: mergedItems.map((item) => ({ cartId: userCart.id, ...item })),
      });
    }

    return this.getCartById(userCart.id);
  }
}
