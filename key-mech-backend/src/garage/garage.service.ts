import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateGarageBuildDto,
  GARAGE_LAYOUTS,
  GarageComponentSelectionDto,
  GarageSelectionsDto,
  UpdateGarageBuildDto,
} from './dto/garage-build.dto.js';

export type GarageSlot =
  | 'case'
  | 'pcb'
  | 'plate'
  | 'switches'
  | 'keycaps'
  | 'stabilizers';

const GARAGE_SLOTS: GarageSlot[] = [
  'case',
  'pcb',
  'plate',
  'switches',
  'keycaps',
  'stabilizers',
];

const SLOT_CATEGORY: Record<GarageSlot, Category> = {
  case: Category.KEYBOARD,
  pcb: Category.PCB,
  plate: Category.PLATE,
  switches: Category.SWITCH,
  keycaps: Category.KEYCAP,
  stabilizers: Category.STABILIZER,
};

const LAYOUT_CHECKED_SLOTS = new Set<GarageSlot>([
  'case',
  'pcb',
  'plate',
  'keycaps',
]);

type GarageLayout = (typeof GARAGE_LAYOUTS)[number];

type ProductForBuild = Prisma.ProductGetPayload<{
  include: {
    variants: true;
    keyboardSpec: true;
    keycapSpec: true;
    switchSpec: true;
  };
}>;

interface PricedGarageComponent {
  slot: GarageSlot;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  category: Category;
  images: Prisma.JsonValue | null;
  unitPrice: number;
}

export interface GarageBuildSnapshot {
  id: string;
  name: string;
  layout: string;
  theme: Prisma.JsonValue;
  selections: Prisma.JsonValue;
  totalPrice: number;
  components: Record<GarageSlot, PricedGarageComponent>;
}

@Injectable()
export class GarageService {
  constructor(private prisma: PrismaService) {}

  private productInclude = {
    variants: true,
    keyboardSpec: true,
    keycapSpec: true,
    switchSpec: true,
  } satisfies Prisma.ProductInclude;

  private assertLayout(layout: string): asserts layout is GarageLayout {
    if (!GARAGE_LAYOUTS.includes(layout as GarageLayout)) {
      throw new BadRequestException('Unsupported Garage layout');
    }
  }

  private parseJsonish(value: unknown): unknown {
    if (typeof value !== 'string') return value;

    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }

  private normalizeLayout(value: unknown): GarageLayout | null {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const normalized = String(value)
      .trim()
      .toUpperCase()
      .replaceAll('%', '')
      .replaceAll(' ', '');

    if (normalized === '65' || normalized === 'P65') return '65';
    if (normalized === '75' || normalized === 'P75') return '75';
    if (normalized === 'TKL' || normalized === 'TENKEYLESS') return 'TKL';
    return null;
  }

  private getLayoutValues(value: unknown): GarageLayout[] {
    const parsed = this.parseJsonish(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => this.normalizeLayout(item))
        .filter((layout): layout is GarageLayout => Boolean(layout));
    }

    const single = this.normalizeLayout(parsed);
    if (single) return [single];

    return [];
  }

  private getSpecLayoutValues(specs: unknown): GarageLayout[] {
    const parsed = this.parseJsonish(specs);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return [];
    }

    const record = parsed as Record<string, unknown>;
    return [
      ...this.getLayoutValues(record.layout),
      ...this.getLayoutValues(record.layouts),
      ...this.getLayoutValues(record.supportedLayouts),
    ];
  }

  private getProductLayoutValues(
    slot: GarageSlot,
    product: ProductForBuild,
    variant: ProductForBuild['variants'][number] | null,
  ) {
    if (!LAYOUT_CHECKED_SLOTS.has(slot)) return [];

    const layouts = [
      ...this.getSpecLayoutValues(variant?.specs),
      ...this.getSpecLayoutValues(product.technicalSpec),
    ];

    if (product.keyboardSpec?.layout) {
      const layout = this.normalizeLayout(product.keyboardSpec.layout);
      if (layout) layouts.push(layout);
    }

    return Array.from(new Set(layouts));
  }

  private assertSelectionRecord(
    selections: unknown,
  ): Record<GarageSlot, GarageComponentSelectionDto> {
    if (
      !selections ||
      typeof selections !== 'object' ||
      Array.isArray(selections)
    ) {
      throw new BadRequestException('Garage selections are required');
    }

    const record = selections as Record<string, unknown>;
    const normalized = {} as Record<GarageSlot, GarageComponentSelectionDto>;

    for (const slot of GARAGE_SLOTS) {
      const selection = record[slot];
      if (
        !selection ||
        typeof selection !== 'object' ||
        Array.isArray(selection) ||
        typeof (selection as Record<string, unknown>).productId !== 'string'
      ) {
        throw new BadRequestException(
          `Missing required Garage component: ${slot}`,
        );
      }

      const variantId = (selection as Record<string, unknown>).variantId;
      if (variantId !== undefined && typeof variantId !== 'string') {
        throw new BadRequestException(
          `Invalid variant for Garage component: ${slot}`,
        );
      }

      normalized[slot] = {
        productId: (selection as Record<string, string>).productId,
        variantId,
      };
    }

    return normalized;
  }

  private async validateAndPriceBuild(
    layout: string,
    selections: GarageSelectionsDto | Prisma.JsonValue,
  ) {
    this.assertLayout(layout);
    const normalizedSelections = this.assertSelectionRecord(selections);
    const productIds = Array.from(
      new Set(GARAGE_SLOTS.map((slot) => normalizedSelections[slot].productId)),
    );

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: this.productInclude,
    });
    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    let totalPrice = 0;
    const components = {} as Record<GarageSlot, PricedGarageComponent>;

    for (const slot of GARAGE_SLOTS) {
      const selection = normalizedSelections[slot];
      const product = productById.get(selection.productId);
      if (!product) {
        throw new BadRequestException(
          `Product not found for Garage component: ${slot}`,
        );
      }

      const expectedCategory = SLOT_CATEGORY[slot];
      if (product.category !== expectedCategory) {
        throw new BadRequestException(
          `${slot} must use a ${expectedCategory} product`,
        );
      }

      const variant = selection.variantId
        ? (product.variants.find((item) => item.id === selection.variantId) ??
          null)
        : null;
      if (selection.variantId && !variant) {
        throw new BadRequestException(
          `Variant does not belong to selected ${slot} product`,
        );
      }

      const supportedLayouts = this.getProductLayoutValues(
        slot,
        product,
        variant,
      );
      if (supportedLayouts.length > 0 && !supportedLayouts.includes(layout)) {
        throw new BadRequestException(
          `${slot} does not support the selected ${layout} layout`,
        );
      }

      const unitPrice = product.price + (variant?.extraPrice ?? 0);
      totalPrice += unitPrice;
      components[slot] = {
        slot,
        productId: product.id,
        variantId: variant?.id ?? null,
        productName: product.name,
        variantName: variant?.name ?? null,
        category: product.category,
        images: product.images,
        unitPrice,
      };
    }

    return { selections: normalizedSelections, totalPrice, components };
  }

  private async findOwnedBuild(userId: string, id: string) {
    const build = await this.prisma.garageBuild.findUnique({ where: { id } });
    if (!build) throw new NotFoundException('Garage build not found');
    if (build.userId !== userId) {
      throw new ForbiddenException('Garage build belongs to another user');
    }
    return build;
  }

  async create(userId: string, dto: CreateGarageBuildDto) {
    const priced = await this.validateAndPriceBuild(dto.layout, dto.selections);

    return this.prisma.garageBuild.create({
      data: {
        userId,
        name: dto.name,
        isPublic: dto.isPublic ?? false,
        layout: dto.layout,
        selections: priced.selections as unknown as Prisma.InputJsonValue,
        theme: dto.theme as Prisma.InputJsonValue,
        totalPrice: priced.totalPrice,
      },
    });
  }

  async findForCurrentUser(userId: string) {
    return this.prisma.garageBuild.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findVisible(id: string, userId?: string) {
    const build = await this.prisma.garageBuild.findUnique({ where: { id } });
    if (!build) throw new NotFoundException('Garage build not found');

    if (!build.isPublic && build.userId !== userId) {
      throw new NotFoundException('Garage build not found');
    }

    return build;
  }

  async update(userId: string, id: string, dto: UpdateGarageBuildDto) {
    const existing = await this.findOwnedBuild(userId, id);
    const layout = dto.layout ?? existing.layout;
    const selections = dto.selections ?? existing.selections;
    const shouldReprice =
      dto.layout !== undefined || dto.selections !== undefined;
    const priced = shouldReprice
      ? await this.validateAndPriceBuild(layout, selections)
      : null;

    return this.prisma.garageBuild.update({
      where: { id },
      data: {
        name: dto.name,
        isPublic: dto.isPublic,
        layout: dto.layout,
        selections: priced?.selections as Prisma.InputJsonValue | undefined,
        theme: dto.theme as Prisma.InputJsonValue | undefined,
        totalPrice: priced?.totalPrice,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwnedBuild(userId, id);
    await this.prisma.garageBuild.delete({ where: { id } });
    return { deleted: true };
  }

  async getCartSnapshot(userId: string, id: string) {
    const build = await this.findVisible(id, userId);
    const priced = await this.validateAndPriceBuild(
      build.layout,
      build.selections,
    );
    const snapshot: GarageBuildSnapshot = {
      id: build.id,
      name: build.name,
      layout: build.layout,
      theme: build.theme,
      selections: build.selections,
      totalPrice: priced.totalPrice,
      components: priced.components,
    };

    return {
      garageBuildId: build.id,
      unitPrice: priced.totalPrice,
      snapshot,
    };
  }
}
