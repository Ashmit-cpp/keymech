import { ForbiddenException } from '@nestjs/common';
import { CommerceItemKind, OrderStatus } from '../../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrdersService } from './orders.service.js';
import { PaymentService } from './payment.service.js';

type MockFunction = ((...args: unknown[]) => unknown) & {
  mockReturnValue: (value: unknown) => void;
  mockResolvedValue: (value: unknown) => void;
};

const mockFn = (): MockFunction => {
  let implementation: ((...args: unknown[]) => unknown) | undefined;
  const mock = ((...args: unknown[]) =>
    implementation?.(...args)) as MockFunction;
  mock.mockReturnValue = (value: unknown) => {
    implementation = () => value;
  };
  mock.mockResolvedValue = (value: unknown) => {
    implementation = () => Promise.resolve(value);
  };
  return mock;
};

const baseOrder = () => ({
  id: 'order-id',
  userId: 'user-id',
  status: OrderStatus.PAID,
  totalAmount: 120000,
  razorpayOrderId: 'rzp-order-id',
  razorpayPaymentId: 'rzp-payment-id',
  createdAt: new Date('2026-05-05T00:00:00.000Z'),
  updatedAt: new Date('2026-05-05T00:00:00.000Z'),
  user: { id: 'user-id', email: 'buyer@example.com', name: 'Buyer' },
  items: [
    {
      id: 'item-id',
      orderId: 'order-id',
      kind: CommerceItemKind.PRODUCT,
      productId: 'product-id',
      variantId: 'variant-id',
      garageBuildId: null,
      buildSnapshot: null,
      quantity: 2,
      unitPrice: 60000,
      product: { id: 'product-id', name: 'Keyboard', images: ['image.jpg'] },
      variant: { id: 'variant-id', name: 'Brass', extraPrice: 10000 },
      garageBuild: null,
    },
  ],
});

const makeOrder = (overrides: Partial<ReturnType<typeof baseOrder>> = {}) => ({
  ...baseOrder(),
  ...overrides,
});

describe('OrdersService', () => {
  const createService = () => {
    const prisma = {
      order: {
        findUnique: mockFn(),
        findMany: mockFn(),
        update: mockFn(),
        findFirst: mockFn(),
      },
      cart: { findUnique: mockFn() },
      $transaction: mockFn(),
    } as unknown as PrismaService;

    const payment = {
      verifyPaymentSignature: mockFn(),
      createRazorpayOrder: mockFn(),
      getKeyId: mockFn(),
    } as unknown as PaymentService;

    return {
      service: new OrdersService(prisma, payment),
      prisma: prisma as unknown as {
        order: {
          findUnique: MockFunction;
          findMany: MockFunction;
          update: MockFunction;
          findFirst: MockFunction;
        };
      },
      payment: payment as unknown as {
        verifyPaymentSignature: MockFunction;
      },
    };
  };

  it('calculates totals from product and variant prices', () => {
    const { service } = createService();
    const cart = {
      items: [
        {
          productId: 'keyboard-id',
          variantId: 'variant-id',
          kind: CommerceItemKind.PRODUCT,
          garageBuildId: null,
          buildSnapshot: null,
          unitPrice: null,
          quantity: 2,
          product: { price: 50000 },
          variant: { extraPrice: 10000 },
        },
        {
          productId: 'switch-id',
          variantId: null,
          kind: CommerceItemKind.PRODUCT,
          garageBuildId: null,
          buildSnapshot: null,
          unitPrice: null,
          quantity: 3,
          product: { price: 1000 },
          variant: null,
        },
      ],
    };

    const items = service.buildPricedItems(
      cart as Parameters<OrdersService['buildPricedItems']>[0],
    );

    expect(items).toEqual([
      {
        productId: 'keyboard-id',
        variantId: 'variant-id',
        kind: CommerceItemKind.PRODUCT,
        garageBuildId: null,
        buildSnapshot: null,
        quantity: 2,
        unitPrice: 60000,
      },
      {
        productId: 'switch-id',
        variantId: null,
        kind: CommerceItemKind.PRODUCT,
        garageBuildId: null,
        buildSnapshot: null,
        quantity: 3,
        unitPrice: 1000,
      },
    ]);
    expect(service.getOrderTotal(items)).toBe(123000);
  });

  it('prices Garage bundles from cart snapshots and excludes products', () => {
    const { service } = createService();
    const cart = {
      items: [
        {
          id: 'cart-garage-id',
          cartId: 'cart-id',
          kind: CommerceItemKind.GARAGE_BUILD,
          productId: null,
          variantId: null,
          garageBuildId: 'build-id',
          buildSnapshot: { name: 'Office 75' },
          unitPrice: 85000,
          quantity: 2,
          product: null,
          variant: null,
        },
      ],
    };

    const items = service.buildPricedItems(
      cart as unknown as Parameters<OrdersService['buildPricedItems']>[0],
    );

    expect(items).toEqual([
      {
        kind: CommerceItemKind.GARAGE_BUILD,
        productId: null,
        variantId: null,
        garageBuildId: 'build-id',
        buildSnapshot: { name: 'Office 75' },
        quantity: 2,
        unitPrice: 85000,
      },
    ]);
    expect(service.getOrderTotal(items)).toBe(170000);
  });

  it('returns the existing order when payment verification is retried', async () => {
    const { service, prisma, payment } = createService();
    payment.verifyPaymentSignature.mockReturnValue(true);
    prisma.order.findUnique.mockResolvedValue(makeOrder());

    await expect(
      service.verifyAndCreateOrder('user-id', {
        razorpay_order_id: 'rzp-order-id',
        razorpay_payment_id: 'rzp-payment-id',
        razorpay_signature: 'valid-signature',
      }),
    ).resolves.toMatchObject({
      id: 'order-id',
      userId: 'user-id',
      items: [{ product: { images: '["image.jpg"]' } }],
    });
  });

  it('rejects an existing payment owned by another user', async () => {
    const { service, prisma, payment } = createService();
    payment.verifyPaymentSignature.mockReturnValue(true);
    prisma.order.findUnique.mockResolvedValue(
      makeOrder({ userId: 'other-user' }),
    );

    await expect(
      service.verifyAndCreateOrder('user-id', {
        razorpay_order_id: 'rzp-order-id',
        razorpay_payment_id: 'rzp-payment-id',
        razorpay_signature: 'valid-signature',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows only admins to list all orders', async () => {
    const { service, prisma } = createService();
    prisma.order.findMany.mockResolvedValue([makeOrder()]);

    await expect(
      service.findAllForAdmin({ userId: 'user-id', email: 'u@example.com' }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    await expect(
      service.findAllForAdmin({
        userId: 'admin-id',
        email: 'admin@example.com',
        role: 'ADMIN',
      }),
    ).resolves.toHaveLength(1);
  });
});
