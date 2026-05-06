import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { OrderStatus } from '../../generated/prisma/enums.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RazorpayOrderResponseDto } from './dto/razorpay-order-response.dto.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';
import { PaymentService } from './payment.service.js';

type CartWithItems = Prisma.CartGetPayload<{
  include: { items: { include: { product: true; variant: true } } };
}>;

const orderInclude = {
  user: { select: { id: true, email: true, name: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, images: true } },
      variant: { select: { id: true, name: true, extraPrice: true } },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
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

  private assertAdmin(user: AuthenticatedUser) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  private serializeImages(images: Prisma.JsonValue | null): string | null {
    if (images === null) return null;
    if (typeof images === 'string') return images;
    return JSON.stringify(images);
  }

  private toOrderResponse(order: OrderWithDetails) {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          images: this.serializeImages(item.product.images),
        },
        variant: item.variant,
      })),
    };
  }

  private async getCartForCheckout(userId: string): Promise<CartWithItems> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!cart || !cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    return cart;
  }

  buildPricedItems(cart: CartWithItems): PricedOrderItem[] {
    return cart.items.map((cartItem) => {
      const price =
        cartItem.product.price + (cartItem.variant?.extraPrice ?? 0);
      return {
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        quantity: cartItem.quantity,
        price,
      };
    });
  }

  getOrderTotal(items: PricedOrderItem[]) {
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

  private async createOrderFromCart(
    userId: string,
    status: OrderStatus,
    payment?: { razorpayOrderId: string; razorpayPaymentId: string },
  ) {
    const cart = await this.getCartForCheckout(userId);
    const items = this.buildPricedItems(cart);
    const total = this.getOrderTotal(items);

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          user: { connect: { id: userId } },
          status,
          totalAmount: total,
          razorpayOrderId: payment?.razorpayOrderId,
          razorpayPaymentId: payment?.razorpayPaymentId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: orderInclude,
      });

      await this.decrementInventory(tx, items);
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    });

    return this.toOrderResponse(order);
  }

  async createOrder(userId: string) {
    return this.createOrderFromCart(userId, OrderStatus.PENDING);
  }

  async findOrdersForUser(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toOrderResponse(order));
  }

  async findOneForUser(user: AuthenticatedUser, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.userId !== user.userId && user.role !== 'ADMIN') {
      throw new ForbiddenException('Order does not belong to current user');
    }

    return this.toOrderResponse(order);
  }

  async findAllForAdmin(user: AuthenticatedUser) {
    this.assertAdmin(user);

    const orders = await this.prisma.order.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toOrderResponse(order));
  }

  async updateStatusForAdmin(
    user: AuthenticatedUser,
    orderId: string,
    status: OrderStatus,
  ) {
    this.assertAdmin(user);

    try {
      const order = await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: orderInclude,
      });

      return this.toOrderResponse(order);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Order not found');
      }
      throw error;
    }
  }

  async createRazorpayOrder(userId: string): Promise<RazorpayOrderResponseDto> {
    const cart = await this.getCartForCheckout(userId);
    const totalAmount = this.getOrderTotal(this.buildPricedItems(cart));

    const razorpayOrder = await this.paymentService.createRazorpayOrder(
      totalAmount,
      'INR',
    );

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: this.paymentService.getKeyId(),
    };
  }

  async verifyAndCreateOrder(userId: string, dto: VerifyPaymentDto) {
    const isValid = this.paymentService.verifyPaymentSignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );

    if (!isValid) {
      throw new BadRequestException('Payment verification failed');
    }

    const existing = await this.prisma.order.findUnique({
      where: { razorpayPaymentId: dto.razorpay_payment_id },
      include: orderInclude,
    });

    if (existing) {
      if (existing.userId !== userId) {
        throw new ForbiddenException('Payment belongs to another user');
      }
      return this.toOrderResponse(existing);
    }

    try {
      return await this.createOrderFromCart(userId, OrderStatus.PAID, {
        razorpayOrderId: dto.razorpay_order_id,
        razorpayPaymentId: dto.razorpay_payment_id,
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const order = await this.prisma.order.findFirst({
          where: {
            OR: [
              { razorpayPaymentId: dto.razorpay_payment_id },
              { razorpayOrderId: dto.razorpay_order_id },
            ],
          },
          include: orderInclude,
        });
        if (order) {
          if (order.userId !== userId) {
            throw new ForbiddenException('Payment belongs to another user');
          }
          return this.toOrderResponse(order);
        }
      }
      throw error;
    }
  }
}
