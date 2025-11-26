import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!cart || !cart.items.length)
      throw new BadRequestException('Cart is empty');

    // build items and total
    const items = cart.items.map((ci) => {
      const basePrice = ci.product.price;
      const extra = ci.variant?.extraPrice ?? 0;
      const price = basePrice + extra;
      return {
        cartItemId: ci.id,
        productId: ci.productId,
        variantId: ci.variantId,
        quantity: ci.quantity,
        price,
      };
    });

    const total = items.reduce((s, it) => s + it.price * it.quantity, 0);

    // Transaction: create order items, decrement inventory, clear cart
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          user: { connect: { id: userId } },
          status: 'PENDING',
          totalAmount: total,
          items: {
            create: items.map((it) => ({
              productId: it.productId,
              variantId: it.variantId ?? null,
              quantity: it.quantity,
              price: it.price,
            })),
          },
        },
        include: { items: true },
      });

      // decrement inventory (basic)
      for (const it of items) {
        if (it.variantId) {
          const inv = await tx.inventory.findUnique({
            where: { variantId: it.variantId },
          });
          if (inv) {
            if (inv.stock < it.quantity)
              throw new BadRequestException('Insufficient stock for a variant');
            await tx.inventory.update({
              where: { id: inv.id },
              data: { stock: inv.stock - it.quantity },
            });
          }
        } else {
          const inv = await tx.inventory.findUnique({
            where: { productId: it.productId },
          });
          if (inv) {
            if (inv.stock < it.quantity)
              throw new BadRequestException('Insufficient stock for a product');
            await tx.inventory.update({
              where: { id: inv.id },
              data: { stock: inv.stock - it.quantity },
            });
          }
        }
      }

      // empty cart items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }

  async findOrdersForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orderId: string) {
    const o = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!o) throw new NotFoundException('Order not found');
    return o;
  }
}
