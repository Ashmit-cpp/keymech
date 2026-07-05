import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../generated/prisma/client.js';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the Prisma seed.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type SeedVariant = {
  name: string;
  sku: string;
  extraPrice?: number;
  images?: unknown;
  specs?: unknown;
};

type SeedProduct = {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  category: string;
  status?: string | null;
  images?: unknown;
  gallery?: unknown;
  soundTests?: unknown;
  explodedView?: string | null;
  technicalSpec?: unknown;
  keyboardSpec?: { create: Record<string, unknown> };
  switchSpec?: { create: Record<string, unknown> };
  keycapSpec?: { create: Record<string, unknown> };
  variants?: { create: SeedVariant[] };
  inventory?: { create: { stock: number } };
};

type SeedCatalog = {
  products: SeedProduct[];
};

type NullableJsonInput =
  | Prisma.InputJsonValue
  | Prisma.NullableJsonNullValueInput;

function toNullableJson(value: unknown): NullableJsonInput {
  if (value === undefined || value === null) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
}

function toNullableString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  return typeof value === 'string' ? value : JSON.stringify(value);
}

function productData(
  product: SeedProduct,
): Prisma.ProductUncheckedCreateInput {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    price: product.price,
    category: product.category as Prisma.ProductUncheckedCreateInput['category'],
    status: product.status ?? null,
    images: toNullableJson(product.images),
    gallery: toNullableJson(product.gallery),
    soundTests: toNullableJson(product.soundTests),
    explodedView: product.explodedView ?? null,
    technicalSpec: toNullableString(product.technicalSpec),
  };
}

function keyboardSpecData(spec: Record<string, unknown>) {
  return {
    ...(spec as Omit<
      Prisma.KeyboardSpecUncheckedCreateInput,
      'id' | 'productId'
    >),
    connectivity: toNullableJson(spec.connectivity),
  };
}

function switchSpecData(spec: Record<string, unknown>) {
  return spec as Omit<Prisma.SwitchSpecUncheckedCreateInput, 'id' | 'productId'>;
}

function keycapSpecData(spec: Record<string, unknown>) {
  return spec as Omit<Prisma.KeycapSpecUncheckedCreateInput, 'id' | 'productId'>;
}

function variantData(variant: SeedVariant) {
  return {
    name: variant.name,
    sku: variant.sku,
    extraPrice: variant.extraPrice ?? 0,
    images: toNullableJson(variant.images),
    specs: toNullableJson(variant.specs),
  };
}

async function loadCatalog(): Promise<SeedCatalog> {
  const catalogPath = fileURLToPath(
    new URL('./researched-garage-products.json', import.meta.url),
  );
  const rawCatalog = await readFile(catalogPath, 'utf8');
  return JSON.parse(rawCatalog) as SeedCatalog;
}

async function syncKeyboardSpec(
  productId: string,
  spec?: Record<string, unknown>,
) {
  if (!spec) {
    await prisma.keyboardSpec.deleteMany({ where: { productId } });
    return;
  }

  const data = keyboardSpecData(spec);

  await prisma.keyboardSpec.upsert({
    where: { productId },
    create: { productId, ...data },
    update: data,
  });
}

async function syncSwitchSpec(productId: string, spec?: Record<string, unknown>) {
  if (!spec) {
    await prisma.switchSpec.deleteMany({ where: { productId } });
    return;
  }

  const data = switchSpecData(spec);

  await prisma.switchSpec.upsert({
    where: { productId },
    create: { productId, ...data },
    update: data,
  });
}

async function syncKeycapSpec(productId: string, spec?: Record<string, unknown>) {
  if (!spec) {
    await prisma.keycapSpec.deleteMany({ where: { productId } });
    return;
  }

  const data = keycapSpecData(spec);

  await prisma.keycapSpec.upsert({
    where: { productId },
    create: { productId, ...data },
    update: data,
  });
}

async function syncVariants(productId: string, variants: SeedVariant[]) {
  for (const variant of variants) {
    const data = variantData(variant);

    await prisma.productVariant.upsert({
      where: { sku: variant.sku },
      create: { productId, ...data },
      update: { productId, ...data },
    });
  }
}

async function syncInventory(productId: string, stock?: number) {
  if (stock === undefined) {
    await prisma.inventory.deleteMany({ where: { productId } });
    return;
  }

  await prisma.inventory.upsert({
    where: { productId },
    create: { productId, stock },
    update: { stock },
  });
}

async function main() {
  const catalog = await loadCatalog();
  const categoryCounts = new Map<string, number>();

  console.log(`Starting seed for ${catalog.products.length} researched products`);

  for (const seedProduct of catalog.products) {
    const data = productData(seedProduct);

    const product = await prisma.product.upsert({
      where: { slug: seedProduct.slug },
      create: data,
      update: data,
      select: { id: true },
    });

    await syncKeyboardSpec(product.id, seedProduct.keyboardSpec?.create);
    await syncSwitchSpec(product.id, seedProduct.switchSpec?.create);
    await syncKeycapSpec(product.id, seedProduct.keycapSpec?.create);
    await syncVariants(product.id, seedProduct.variants?.create ?? []);
    await syncInventory(product.id, seedProduct.inventory?.create.stock);

    categoryCounts.set(
      seedProduct.category,
      (categoryCounts.get(seedProduct.category) ?? 0) + 1,
    );
  }

  const categorySummary = Array.from(categoryCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, count]) => `${category}: ${count}`)
    .join(', ');

  console.log(`Seed completed: ${categorySummary}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
