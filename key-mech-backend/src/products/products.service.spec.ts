import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductsService } from './products.service.js';

type MockFunction = ((...args: unknown[]) => unknown) & {
  calls: unknown[][];
  mockResolvedValue: (value: unknown) => MockFunction;
};

const mockFn = (): MockFunction => {
  let value: unknown;
  const mock = ((...args: unknown[]) => {
    mock.calls.push(args);
    return Promise.resolve(value);
  }) as MockFunction;
  mock.calls = [];
  mock.mockResolvedValue = (next: unknown) => {
    value = next;
    return mock;
  };
  return mock;
};

describe('ProductsService', () => {
  it('returns a product and its commerce relations by slug', async () => {
    const product = {
      id: 'product-id',
      slug: 'specter-75',
      variants: [{ id: 'variant-id' }],
      keyboardSpec: { layout: 'P75' },
      switchSpec: null,
      keycapSpec: null,
    };
    const findUnique = mockFn().mockResolvedValue(product);
    const prisma = { product: { findUnique } } as unknown as PrismaService;
    const service = new ProductsService(prisma);

    await expect(service.findOneBySlug('specter-75')).resolves.toBe(product);
    expect(findUnique.calls[0]?.[0]).toEqual({
      where: { slug: 'specter-75' },
      include: {
        variants: true,
        keyboardSpec: true,
        switchSpec: true,
        keycapSpec: true,
      },
    });
  });

  it('returns a not-found error for an unknown slug', async () => {
    const prisma = {
      product: { findUnique: mockFn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const service = new ProductsService(prisma);

    await expect(service.findOneBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
