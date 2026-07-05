import { BadRequestException } from '@nestjs/common';
import { Category } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGarageBuildDto } from './dto/garage-build.dto.js';
import { GarageService } from './garage.service.js';

type MockFunction = ((...args: unknown[]) => unknown) & {
  calls: unknown[][];
  mockImplementation: (
    implementation: (...args: unknown[]) => unknown,
  ) => MockFunction;
  mockResolvedValue: (value: unknown) => MockFunction;
};

const mockFn = (): MockFunction => {
  let implementation: ((...args: unknown[]) => unknown) | undefined;
  const mock = ((...args: unknown[]) => {
    mock.calls.push(args);
    return implementation?.(...args);
  }) as MockFunction;
  mock.calls = [];
  mock.mockImplementation = (next: (...args: unknown[]) => unknown) => {
    implementation = next;
    return mock;
  };
  mock.mockResolvedValue = (value: unknown) => {
    implementation = () => Promise.resolve(value);
    return mock;
  };
  return mock;
};

const selections = {
  case: { productId: 'case-id', variantId: 'case-var-id' },
  pcb: { productId: 'pcb-id', variantId: 'pcb-var-id' },
  plate: { productId: 'plate-id', variantId: 'plate-var-id' },
  switches: { productId: 'switch-id' },
  keycaps: { productId: 'keycap-id' },
  stabilizers: { productId: 'stabilizer-id' },
};

const createDto = (
  overrides: Partial<CreateGarageBuildDto> = {},
): CreateGarageBuildDto => ({
  name: 'Office 75',
  layout: '75',
  selections,
  theme: { base: '#111111' },
  ...overrides,
});

const product = (
  id: string,
  category: Category,
  price: number,
  options: {
    variantId?: string;
    variantExtraPrice?: number;
    keyboardLayout?: string;
    variantLayouts?: string[];
  } = {},
) => ({
  id,
  name: `${id} product`,
  category,
  price,
  images: [],
  technicalSpec: null,
  keyboardSpec: options.keyboardLayout
    ? { layout: options.keyboardLayout }
    : null,
  keycapSpec: null,
  switchSpec: null,
  variants: options.variantId
    ? [
        {
          id: options.variantId,
          name: `${options.variantId} variant`,
          extraPrice: options.variantExtraPrice ?? 0,
          specs: options.variantLayouts
            ? { supportedLayouts: options.variantLayouts }
            : null,
        },
      ]
    : [],
});

const validProducts = () => [
  product('case-id', Category.KEYBOARD, 100000, {
    variantId: 'case-var-id',
    variantExtraPrice: 5000,
    keyboardLayout: 'P75',
  }),
  product('pcb-id', Category.PCB, 12000, {
    variantId: 'pcb-var-id',
    variantLayouts: ['75', 'P75'],
  }),
  product('plate-id', Category.PLATE, 5000, {
    variantId: 'plate-var-id',
    variantExtraPrice: 500,
    variantLayouts: ['75'],
  }),
  product('switch-id', Category.SWITCH, 3500),
  product('keycap-id', Category.KEYCAP, 18000),
  product('stabilizer-id', Category.STABILIZER, 2400),
];

describe('GarageService', () => {
  const createService = (products = validProducts()) => {
    const findMany = mockFn().mockResolvedValue(products);
    const create = mockFn().mockImplementation(
      ({ data }: { data: unknown }) => ({
        id: 'build-id',
        ...(data as Record<string, unknown>),
      }),
    );
    const prisma = {
      product: { findMany },
      garageBuild: { create },
    } as unknown as PrismaService;

    return {
      service: new GarageService(prisma),
      mocks: { findMany, create },
    };
  };

  it('requires every Garage component slot', async () => {
    const { service } = createService();
    const missingPcb = {
      ...selections,
      pcb: undefined,
    } as unknown as CreateGarageBuildDto['selections'];

    await expect(
      service.create('user-id', createDto({ selections: missingPcb })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('enforces slot product categories', async () => {
    const products = validProducts();
    products[1] = product('pcb-id', Category.ACCESSORY, 12000, {
      variantId: 'pcb-var-id',
    });
    const { service } = createService(products);

    await expect(service.create('user-id', createDto())).rejects.toThrow(
      'pcb must use a PCB product',
    );
  });

  it('verifies selected variants belong to the selected product', async () => {
    const dto = createDto({
      selections: {
        ...selections,
        pcb: { productId: 'pcb-id', variantId: 'missing-var-id' },
      },
    });
    const { service } = createService();

    await expect(service.create('user-id', dto)).rejects.toThrow(
      'Variant does not belong to selected pcb product',
    );
  });

  it('rejects layout-incompatible parts when layout specs exist', async () => {
    const products = validProducts();
    products[0] = product('case-id', Category.KEYBOARD, 100000, {
      variantId: 'case-var-id',
      keyboardLayout: 'P65',
    });
    const { service } = createService(products);

    await expect(service.create('user-id', createDto())).rejects.toThrow(
      'case does not support the selected 75 layout',
    );
  });

  it('recalculates total price from selected products and variants', async () => {
    const { service, mocks } = createService();

    await service.create('user-id', createDto({ isPublic: true }));

    const [createArg] = mocks.create.calls[0] ?? [];
    const data = (createArg as { data: Record<string, unknown> }).data;
    expect(data).toMatchObject({
      userId: 'user-id',
      name: 'Office 75',
      isPublic: true,
      layout: '75',
      totalPrice: 146400,
    });
  });
});
