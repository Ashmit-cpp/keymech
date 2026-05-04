import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaymentService } from './payment.service.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';
import { Prisma } from '../../generated/prisma/client.js';

type CartWithItems = Prisma.CartGetPayload<{
  include: { items: { include: { product: true; variant: true } } };
}>;

interface PricedOrderItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
  ) {}

  private async getCartForCheckout(userId: string): Promise<CartWithItems> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!cart || !cart.items.length)
      throw new BadRequestException('Cart is empty');

    return cart;
  }

  private buildPricedItems(cart: CartWithItems): PricedOrderItem[] {
    return cart.items.map((ci) => {
      const basePrice = ci.product.price;
      const extra = ci.variant?.extraPrice ?? 0;
      const price = basePrice + extra;
      return {
        productId: ci.productId,
        variantId: ci.variantId,
        quantity: ci.quantity,
        price,
      };
    });
  }

  private getOrderTotal(items: PricedOrderItem[]) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private async decrementInventory(
    tx: Prisma.TransactionClient,
    items: PricedOrderItem[],
  ) {
    for (const item of items) {
      if (item.variantId) {
        const inventory = await tx.inventory.findUnique({
          where: { variantId: item.variantId },
        });
        if (!inventory) continue;
        if (inventory.stock < item.quantity) {
          throw new BadRequestException('Insufficient stock for a variant');
        }
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { stock: inventory.stock - item.quantity },
        });
        continue;
      }

      const inventory = await tx.inventory.findUnique({
        where: { productId: item.productId },
      });
      if (!inventory) continue;
      if (inventory.stock < item.quantity) {
        throw new BadRequestException('Insufficient stock for a product');
      }
      await tx.inventory.update({
        where: { id: inventory.id },
        data: { stock: inventory.stock - item.quantity },
      });
    }
  }

  async createOrder(userId: string) {
    const cart = await this.getCartForCheckout(userId);
    const items = this.buildPricedItems(cart);
    const total = this.getOrderTotal(items);

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

      await this.decrementInventory(tx, items);
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

  async createRazorpayOrder(userId: string) {
    const cart = await this.getCartForCheckout(userId);
    const totalAmount = this.getOrderTotal(this.buildPricedItems(cart));

    const razorpayOrder = await this.paymentService.createRazorpayOrder(
      totalAmount,
      'INR',
    );

    const keyId = this.paymentService.getKeyId();

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
    };
  }

  async verifyAndCreateOrder(dto: VerifyPaymentDto) {
    const isValid = this.paymentService.verifyPaymentSignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestException('Payment verification failed');
    }

    const cart = await this.getCartForCheckout(dto.userId);
    const items = this.buildPricedItems(cart);
    const total = this.getOrderTotal(items);

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          user: { connect: { id: dto.userId } },
          status: 'PAID',
          totalAmount: total,
          razorpayOrderId: dto.razorpay_order_id,
          razorpayPaymentId: dto.razorpay_payment_id,
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

      await this.decrementInventory(tx, items);
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  }
}
