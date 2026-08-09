import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Category } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        status: dto.status,
        images: dto.images ?? [],
        gallery: dto.gallery ?? [],
        soundTests: dto.soundTests ?? [],
        explodedView: dto.explodedView,
        technicalSpec: dto.technicalSpec,
        keyboardSpec: dto.keyboardSpec
          ? { create: dto.keyboardSpec }
          : undefined,
        switchSpec: dto.switchSpec ? { create: dto.switchSpec } : undefined,
        keycapSpec: dto.keycapSpec ? { create: dto.keycapSpec } : undefined,
        variants: dto.variants
          ? {
              create: dto.variants.map((v) => ({
                name: v.name,
                sku: v.sku,
                extraPrice: v.extraPrice ?? 0,
                images: v.images ?? [],
                specs:
                  v.specs === undefined
                    ? undefined
                    : (v.specs as Prisma.InputJsonValue),
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
        keyboardSpec: true,
        switchSpec: true,
        keycapSpec: true,
      },
    });
  }

  findAll(params?: { search?: string; category?: string }) {
    const search = params?.search?.trim();
    const category = params?.category?.trim();

    const where: Prisma.ProductWhereInput = {};

    const categoryEnum =
      category && Category[category.toUpperCase() as keyof typeof Category];
    if (categoryEnum) {
      where.category = categoryEnum;
    }

    const or: Prisma.ProductWhereInput['OR'] = search
      ? [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      : undefined;

    if (or) {
      where.OR = or;
    }

    const hasFilters = Boolean(categoryEnum) || Boolean(or);

    return this.prisma.product.findMany({
      where: hasFilters ? where : undefined,
      include: {
        variants: true,
        keyboardSpec: true,
        switchSpec: true,
        keycapSpec: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        keyboardSpec: true,
        switchSpec: true,
        keycapSpec: true,
      },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async findOneBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        keyboardSpec: true,
        switchSpec: true,
        keycapSpec: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id); // will throw if not found
    // Basic approach: update top-level fields only. For nested specs/variants, implement specific endpoints.
    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        images: dto.images ?? undefined,
        gallery: dto.gallery ?? undefined,
      },
      include: {
        variants: true,
        keyboardSpec: true,
        switchSpec: true,
        keycapSpec: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
