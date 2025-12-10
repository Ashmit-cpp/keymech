import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Cart } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCartItemDto } from './dto/create-cart-item.dto.js';
import { CreateCartDto } from './dto/create-cart.dto.js';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private includeItems = {
    items: { include: { product: true, variant: true } },
  } satisfies Prisma.CartInclude;

  private async getOrCreateCartById(cartId: string, userId?: string | null) {
    let cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: this.includeItems,
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { id: cartId, userId: userId ?? undefined } as Prisma.CartUncheckedCreateInput,
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

  async addItemByCartId(cartId: string, item: CreateCartItemDto, userId?: string | null) {
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
    console.log('[CART] Starting mergeCarts:', { guestCartId, userId });
    
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error('[CART] User not found:', userId);
      throw new NotFoundException('User not found');
    }

    const guestCart = await this.prisma.cart.findUnique({
      where: { id: guestCartId },
      include: { items: true },
    });
    console.log('[CART] Guest cart:', guestCart ? `Found with ${guestCart.items.length} items` : 'Not found');

    const userCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    console.log('[CART] User cart:', userCart ? `Found with ${userCart.items.length} items` : 'Not found');

    if (!guestCart && !userCart) {
      console.log('[CART] No carts found, creating new cart for user');
      return this.getOrCreateCartByUser(userId);
    }

    const map = new Map<string, number>();
    const accumulate = (items?: { productId: string; variantId: string | null; quantity: number }[]) => {
      items?.forEach((it) => {
        const key = `${it.productId}:${it.variantId ?? 'null'}`;
        map.set(key, (map.get(key) ?? 0) + it.quantity);
      });
    };
    accumulate(guestCart?.items);
    accumulate(userCart?.items);
    console.log('[CART] Merged items map size:', map.size);

    const targetCart =
      userCart ??
      (await this.prisma.cart.create({
        data: { userId },
        include: { items: true },
      }));
    console.log('[CART] Target cart ID:', targetCart.id);

    await this.prisma.cartItem.deleteMany({ where: { cartId: targetCart.id } });
    console.log('[CART] Cleared existing items from target cart');
    
    await this.prisma.cartItem.createMany({
      data: Array.from(map.entries()).map(([key, qty]) => {
        const [productId, variantId] = key.split(':');
        return {
          cartId: targetCart.id,
          productId,
          variantId: variantId === 'null' ? null : variantId,
          quantity: qty,
        };
      }),
    });
    console.log('[CART] Created merged items in target cart');

    if (guestCart && guestCart.id !== targetCart.id) {
      console.log('[CART] Deleting guest cart:', guestCart.id);
      // Clear guest items before deleting to avoid FK violations
      await this.prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
      await this.prisma.cart.delete({ where: { id: guestCart.id } });
      console.log('[CART] Guest cart deleted');
    }

    if (!targetCart.userId) {
      console.log('[CART] Updating target cart with userId');
      await this.prisma.cart.update({
        where: { id: targetCart.id },
        data: { userId },
      });
    }

    console.log('[CART] Merge complete, returning cart');
    return this.getCartById(targetCart.id);
  }

  async mergeGuestCartItems(
    userId: string,
    guestItems: { productId: string; variantId?: string; quantity: number }[],
  ) {
    console.log('[CART] Starting mergeGuestCartItems:', { userId, itemCount: guestItems.length });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error('[CART] User not found:', userId);
      throw new NotFoundException('User not found');
    }

    // Get or create user cart
    const userCart = await this.getOrCreateCartByUser(userId);
    console.log('[CART] User cart:', `Found/Created with ${userCart.items.length} items`);

    // Build a map of all items (existing + guest)
    const map = new Map<string, number>();
    
    // Add existing user cart items
    userCart.items.forEach((item) => {
      const key = `${item.productId}:${item.variantId ?? 'null'}`;
      map.set(key, item.quantity);
    });

    // Add guest cart items (merge quantities if item already exists)
    guestItems.forEach((item) => {
      const key = `${item.productId}:${item.variantId ?? 'null'}`;
      map.set(key, (map.get(key) ?? 0) + item.quantity);
    });

    console.log('[CART] Merged items map size:', map.size);

    // Clear existing items and create merged items
    await this.prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
    console.log('[CART] Cleared existing items from user cart');

    if (map.size > 0) {
      await this.prisma.cartItem.createMany({
        data: Array.from(map.entries()).map(([key, qty]) => {
          const [productId, variantId] = key.split(':');
          return {
            cartId: userCart.id,
            productId,
            variantId: variantId === 'null' ? null : variantId,
            quantity: qty,
          };
        }),
      });
      console.log('[CART] Created merged items in user cart');
    }

    console.log('[CART] Merge complete, returning cart');
    return this.getCartById(userCart.id);
  }
}
