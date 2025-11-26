import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCartItemDto } from './dto/create-cart-item.dto.js';
import { CreateCartDto } from './dto/create-cart.dto.js';


@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async createCart(dto: CreateCartDto) {
    // create or replace cart for user
    const existing = await this.prisma.cart.findUnique({
      where: { userId: dto.userId },
    });
    if (existing) {
      // remove existing items and recreate
      await this.prisma.cartItem.deleteMany({ where: { cartId: existing.id } });
      return this.prisma.cart.update({
        where: { id: existing.id },
        data: {
          items: {
            create: dto.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId ?? null,
              quantity: i.quantity,
            })),
          },
        },
        include: { items: true },
      });
    }

    return this.prisma.cart.create({
      data: {
        user: { connect: { id: dto.userId } },
        items: {
          create: dto.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? null,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  async addItem(userId: string, item: CreateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    if (!cart) throw new NotFoundException('Cart not found for user');
    // if same product+variant exists, increment
    const existing = cart.items.find(
      (ci) =>
        ci.productId === item.productId &&
        ci.variantId === (item.variantId ?? null),
    );
    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    }
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
      },
    });
  }

  async getCartByUser(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  async removeItem(cartItemId: string) {
    return this.prisma.cartItem.delete({ where: { id: cartItemId } });
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });
  }
}
