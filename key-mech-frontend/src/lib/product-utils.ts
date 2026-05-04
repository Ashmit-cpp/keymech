import type { ProductResponseDto } from "@/api/generated";

export type ProductLike = ProductResponseDto;

export const getStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return getStringArray(parsed);
    } catch {
      return [];
    }
  }

  return [];
};

export const getFirstImage = (value: unknown) => getStringArray(value)[0] ?? null;

export const getSpecField = (value: unknown, key: string): string | null => {
  if (!value || typeof value !== "object" || !(key in value)) return null;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === "string" ? field : null;
};

