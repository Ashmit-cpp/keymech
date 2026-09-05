import { readFile } from 'node:fs/promises';

export type SoundTestResearch = {
  url: string;
  title: string;
  channel: string;
  configuration: string;
  verifiedAt: string;
};

export type ProductEnrichment = {
  slug: string;
  soundTests: SoundTestResearch[];
  technicalSpec?: Record<string, unknown>;
  switchSpecPatch?: Record<string, unknown>;
};

export type ProductEnrichmentCatalog = {
  version: number;
  products: ProductEnrichment[];
  unmatchedProducts: Array<{ slug: string; reason: string }>;
};

const canonicalYouTubeUrl =
  /^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})$/;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export async function loadProductEnrichments() {
  const enrichmentPath = new URL('./product-enrichments.json', import.meta.url);
  const raw = await readFile(enrichmentPath, 'utf8');
  const catalog = JSON.parse(raw) as ProductEnrichmentCatalog;
  const errors = validateProductEnrichments(catalog);

  if (errors.length > 0) {
    throw new Error(`Invalid product enrichments:\n- ${errors.join('\n- ')}`);
  }

  return catalog;
}

export function soundTestUrls(enrichment: ProductEnrichment) {
  return enrichment.soundTests.map(({ url }) => url);
}

export function validateProductEnrichments(
  catalog: ProductEnrichmentCatalog,
): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const videoIds = new Set<string>();

  if (catalog.version !== 1) {
    errors.push(`unsupported version ${String(catalog.version)}`);
  }

  if (!Array.isArray(catalog.products) || catalog.products.length === 0) {
    errors.push('products must be a non-empty array');
    return errors;
  }

  for (const product of catalog.products) {
    if (!product.slug || slugs.has(product.slug)) {
      errors.push(`missing or duplicate product slug: ${product.slug}`);
    }
    slugs.add(product.slug);

    if (!Array.isArray(product.soundTests) || product.soundTests.length === 0) {
      errors.push(`${product.slug} must include at least one sound test`);
      continue;
    }

    for (const soundTest of product.soundTests) {
      const match = canonicalYouTubeUrl.exec(soundTest.url);
      if (!match) {
        errors.push(`${product.slug} has a non-canonical YouTube URL`);
      } else if (videoIds.has(match[1])) {
        errors.push(`${product.slug} reuses YouTube video ${match[1]}`);
      } else {
        videoIds.add(match[1]);
      }

      for (const field of ['title', 'channel', 'configuration'] as const) {
        if (!soundTest[field]?.trim()) {
          errors.push(`${product.slug} sound test is missing ${field}`);
        }
      }

      if (!isoDate.test(soundTest.verifiedAt)) {
        errors.push(`${product.slug} has an invalid verifiedAt date`);
      }
    }
  }

  for (const unmatched of catalog.unmatchedProducts ?? []) {
    if (!unmatched.slug || slugs.has(unmatched.slug)) {
      errors.push(`invalid or already-enriched unmatched slug: ${unmatched.slug}`);
    }
    if (!unmatched.reason?.trim()) {
      errors.push(`${unmatched.slug} is missing an unmatched reason`);
    }
    slugs.add(unmatched.slug);
  }

  return errors;
}
