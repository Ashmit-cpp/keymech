import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../generated/prisma/client.js';
import {
  loadProductEnrichments,
  soundTestUrls,
} from '../prisma/product-enrichments.js';

type SeedCatalog = { products: Array<{ slug: string; category: string }> };

const args = new Set(process.argv.slice(2));
const write = args.has('--write');
const compareDatabase = write || args.has('--dry-run');
const checkRemote = args.has('--remote');

function toNullableString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

async function validateRemoteVideos(
  products: Awaited<ReturnType<typeof loadProductEnrichments>>['products'],
) {
  for (const product of products) {
    for (const soundTest of product.soundTests) {
      const endpoint = new URL('https://www.youtube.com/oembed');
      endpoint.searchParams.set('url', soundTest.url);
      endpoint.searchParams.set('format', 'json');
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(
          `${product.slug} video is unavailable (${response.status}): ${soundTest.url}`,
        );
      }

      const metadata = (await response.json()) as {
        title?: string;
        author_name?: string;
      };
      if (
        metadata.title !== soundTest.title ||
        metadata.author_name !== soundTest.channel
      ) {
        throw new Error(
          `${product.slug} YouTube metadata changed for ${soundTest.url}`,
        );
      }
    }
  }
}

async function main() {
  const enrichments = await loadProductEnrichments();
  const catalogPath = fileURLToPath(
    new URL('../prisma/researched-garage-products.json', import.meta.url),
  );
  const catalog = JSON.parse(
    await readFile(catalogPath, 'utf8'),
  ) as SeedCatalog;
  const catalogProducts = new Map(
    catalog.products.map((product) => [product.slug, product]),
  );

  for (const entry of [
    ...enrichments.products,
    ...enrichments.unmatchedProducts,
  ]) {
    const product = catalogProducts.get(entry.slug);
    if (!product) {
      throw new Error(`Enrichment references unknown slug: ${entry.slug}`);
    }
    if (!['KEYBOARD', 'SWITCH'].includes(product.category)) {
      throw new Error(
        `Sound enrichment is only allowed for keyboards and switches: ${entry.slug}`,
      );
    }
  }

  if (checkRemote) {
    await validateRemoteVideos(enrichments.products);
  }

  console.log(
    `Validated ${enrichments.products.length} product enrichments and ${enrichments.unmatchedProducts.length} documented unmatched product(s).`,
  );

  if (!compareDatabase) return;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for --dry-run or --write.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const slugs = enrichments.products.map(({ slug }) => slug);
    const existingProducts = await prisma.product.findMany({
      where: { slug: { in: slugs } },
      select: {
        id: true,
        slug: true,
        soundTests: true,
        technicalSpec: true,
        switchSpec: true,
      },
    });
    const existingBySlug = new Map(
      existingProducts.map((product) => [product.slug, product]),
    );
    const missing = slugs.filter((slug) => !existingBySlug.has(slug));

    if (missing.length > 0) {
      throw new Error(`Database is missing products: ${missing.join(', ')}`);
    }

    const changed = enrichments.products.filter((enrichment) => {
      const current = existingBySlug.get(enrichment.slug)!;
      const switchSpecChanged = Object.entries(
        enrichment.switchSpecPatch ?? {},
      ).some(
        ([key, value]) =>
          current.switchSpec?.[key as keyof typeof current.switchSpec] !==
          value,
      );
      return (
        JSON.stringify(current.soundTests) !==
          JSON.stringify(soundTestUrls(enrichment)) ||
        (enrichment.technicalSpec !== undefined &&
          current.technicalSpec !==
            toNullableString(enrichment.technicalSpec)) ||
        switchSpecChanged
      );
    });

    console.log(
      `${write ? 'Writing' : 'Would write'} ${changed.length} changed product enrichment(s).`,
    );

    if (write && changed.length > 0) {
      await prisma.$transaction(
        changed.flatMap((enrichment) => {
          const operations: Prisma.PrismaPromise<unknown>[] = [
            prisma.product.update({
              where: { slug: enrichment.slug },
              data: {
                soundTests: soundTestUrls(enrichment),
                technicalSpec:
                  enrichment.technicalSpec === undefined
                    ? undefined
                    : toNullableString(enrichment.technicalSpec),
              },
            }),
          ];

          if (enrichment.switchSpecPatch) {
            operations.push(
              prisma.switchSpec.update({
                where: {
                  productId: existingBySlug.get(enrichment.slug)!.id,
                },
                data: enrichment.switchSpecPatch,
              }),
            );
          }

          return operations;
        }),
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Product enrichment sync failed:', error);
  process.exitCode = 1;
});
