import { CommerceItemKind } from '../../generated/prisma/enums.js';
import { GarageService } from '../garage/garage.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CartService } from './cart.service.js';

type MockFunction = ((...args: unknown[]) => unknown) & {
  calls: unknown[][];
  mockResolvedValue: (value: unknown) => MockFunction;
  mockResolvedValueOnce: (value: unknown) => MockFunction;
};

const mockFn = (): MockFunction => {
  const queue: ((...args: unknown[]) => unknown)[] = [];
  let implementation: ((...args: unknown[]) => unknown) | undefined;
  const mock = ((...args: unknown[]) => {
    mock.calls.push(args);
    const next = queue.shift();
    if (next) return next(...args);
    return implementation?.(...args);
  }) as MockFunction;
  mock.calls = [];
  mock.mockResolvedValue = (value: unknown) => {
    implementation = () => Promise.resolve(value);
    return mock;
  };
  mock.mockResolvedValueOnce = (value: unknown) => {
    queue.push(() => Promise.resolve(value));
    return mock;
  };
  return mock;
};

describe('CartService', () => {
  it('adds Garage builds with a snapshot and unit price', async () => {
    const updatedCart = {
      id: 'cart-id',
      items: [
        {
          id: 'cart-item-id',
          kind: CommerceItemKind.GARAGE_BUILD,
          garageBuildId: 'build-id',
          unitPrice: 123400,
          quantity: 1,
        },
      ],
    };
    const findUnique = mockFn()
      .mockResolvedValueOnce({ id: 'cart-id', userId: 'user-id', items: [] })
      .mockResolvedValueOnce(updatedCart);
    const create = mockFn().mockResolvedValue({ id: 'cart-item-id' });
    const getCartSnapshot = mockFn().mockResolvedValue({
      garageBuildId: 'build-id',
      unitPrice: 123400,
      snapshot: { id: 'build-id', name: 'Office 75' },
    });
    const prisma = {
      cart: { findUnique },
      cartItem: {
        create,
      },
    } as unknown as PrismaService;
    const garage = {
      getCartSnapshot,
    } as unknown as GarageService;
    const service = new CartService(prisma, garage);

    await expect(
      service.addGarageBuildByUserId('user-id', {
        garageBuildId: 'build-id',
        quantity: 1,
      }),
    ).resolves.toBe(updatedCart);

    expect(getCartSnapshot.calls).toEqual([['user-id', 'build-id']]);
    expect(create.calls).toEqual([
      [
        {
          data: {
            cartId: 'cart-id',
            kind: CommerceItemKind.GARAGE_BUILD,
            garageBuildId: 'build-id',
            buildSnapshot: { id: 'build-id', name: 'Office 75' },
            unitPrice: 123400,
            quantity: 1,
          },
        },
      ],
    ]);
  });

  it('increments an existing Garage build cart row', async () => {
    const updatedCart = { id: 'cart-id', items: [] };
    const findUnique = mockFn()
      .mockResolvedValueOnce({
        id: 'cart-id',
        userId: 'user-id',
        items: [
          {
            id: 'cart-item-id',
            kind: CommerceItemKind.GARAGE_BUILD,
            garageBuildId: 'build-id',
            quantity: 1,
          },
        ],
      })
      .mockResolvedValueOnce(updatedCart);
    const update = mockFn().mockResolvedValue({ id: 'cart-item-id' });
    const getCartSnapshot = mockFn();
    const prisma = {
      cart: { findUnique },
      cartItem: {
        update,
      },
    } as unknown as PrismaService;
    const garage = {
      getCartSnapshot,
    } as unknown as GarageService;
    const service = new CartService(prisma, garage);

    await expect(
      service.addGarageBuildByUserId('user-id', {
        garageBuildId: 'build-id',
        quantity: 2,
      }),
    ).resolves.toBe(updatedCart);

    expect(getCartSnapshot.calls).toHaveLength(0);
    expect(update.calls).toEqual([
      [{ where: { id: 'cart-item-id' }, data: { quantity: 3 } }],
    ]);
  });
});
