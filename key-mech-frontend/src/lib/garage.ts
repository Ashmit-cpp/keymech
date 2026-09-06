import type {
  GarageBuildResponseDto,
  GarageSelectionsDto,
  ProductResponseDto,
  ProductVariantResponseDto,
} from "@/api/generated";
import {
  cloneGarageTheme,
  DEFAULT_GARAGE_PRESET,
  readableLegendColor,
  type GarageKeycapTheme,
} from "@/lib/garage-theme";

export type GarageLayout = "60" | "65" | "75" | "TKL" | "FULL";
export type GarageSlot =
  | "case"
  | "pcb"
  | "plate"
  | "switches"
  | "keycaps"
  | "stabilizers";

export interface GarageSelection {
  productId?: string;
  variantId?: string;
}

export interface GarageComponentSnapshot {
  slot: GarageSlot;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  category: string;
  images?: unknown;
  unitPrice: number;
  includedInBase?: boolean;
}

export interface GarageBuildSnapshot {
  id: string;
  name: string;
  layout: GarageLayout;
  theme: GarageKeycapTheme;
  selections: GarageSelectionsDto;
  totalPrice: number;
  components: Record<GarageSlot, GarageComponentSnapshot>;
}

export const GARAGE_LAYOUTS: GarageLayout[] = ["60", "75", "TKL", "FULL"];

export const GARAGE_SLOTS: {
  id: GarageSlot;
  label: string;
  category: string;
  shortLabel: string;
}[] = [
  { id: "case", label: "Case / kit", category: "KEYBOARD", shortLabel: "Case" },
  { id: "pcb", label: "PCB", category: "PCB", shortLabel: "PCB" },
  { id: "plate", label: "Plate", category: "PLATE", shortLabel: "Plate" },
  { id: "switches", label: "Switches", category: "SWITCH", shortLabel: "Switches" },
  { id: "keycaps", label: "Keycaps", category: "KEYCAP", shortLabel: "Keycaps" },
  {
    id: "stabilizers",
    label: "Stabilizers",
    category: "STABILIZER",
    shortLabel: "Stabs",
  },
];

export const emptyGarageSelections = (): Record<GarageSlot, GarageSelection> => ({
  case: {},
  pcb: {},
  plate: {},
  switches: {},
  keycaps: {},
  stabilizers: {},
});

export const normalizeGarageLayout = (value: unknown): GarageLayout | null => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replaceAll("%", "")
    .replaceAll(" ", "");
  if (normalized === "60" || normalized === "P60") return "60";
  if (["FULL", "FULLSIZE", "FULL-SIZE", "100", "P100"].includes(normalized)) return "FULL";
  if (normalized === "65" || normalized === "P65") return "65";
  if (normalized === "75" || normalized === "P75") return "75";
  if (normalized === "TKL" || normalized === "TENKEYLESS") return "TKL";
  return null;
};

export const parseJsonish = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

const getLayoutsFromValue = (value: unknown): GarageLayout[] => {
  const parsed = parseJsonish(value);
  if (Array.isArray(parsed)) {
    return parsed
      .map(normalizeGarageLayout)
      .filter((layout): layout is GarageLayout => Boolean(layout));
  }

  const single = normalizeGarageLayout(parsed);
  return single ? [single] : [];
};

const getLayoutsFromObject = (value: unknown): GarageLayout[] => {
  const parsed = parseJsonish(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
  const record = parsed as Record<string, unknown>;
  return [
    ...getLayoutsFromValue(record.layout),
    ...getLayoutsFromValue(record.layouts),
    ...getLayoutsFromValue(record.supportedLayouts),
  ];
};

export const getProductSupportedLayouts = (
  product: ProductResponseDto,
  variant?: ProductVariantResponseDto | null,
): GarageLayout[] => {
  const layouts = [
    ...getLayoutsFromObject(variant?.specs),
    ...getLayoutsFromObject(product.keyboardSpec),
  ];
  return Array.from(new Set(layouts));
};

export const supportsGarageLayout = (
  product: ProductResponseDto,
  layout: GarageLayout,
  variant?: ProductVariantResponseDto | null,
) => {
  const layouts = getProductSupportedLayouts(product, variant);
  return layouts.length === 0 || layouts.includes(layout);
};

const INCLUDED_COMPONENT_SPEC_KEYS = {
  pcb: "pcbSku",
  plate: "plateSku",
  switches: "switchSku",
  keycaps: "keycapSku",
  stabilizers: "stabilizerSku",
} as const;

export const getIncludedGarageComponentSkus = (
  variant?: ProductVariantResponseDto | null,
): Partial<Record<Exclude<GarageSlot, "case">, string>> => {
  const specs = parseJsonish(variant?.specs);
  if (!specs || typeof specs !== "object" || Array.isArray(specs)) return {};

  const components = (specs as Record<string, unknown>).garageComponents;
  if (!components || typeof components !== "object" || Array.isArray(components)) {
    return {};
  }

  const record = components as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(INCLUDED_COMPONENT_SPEC_KEYS).flatMap(([slot, key]) =>
      typeof record[key] === "string" ? [[slot, record[key]]] : [],
    ),
  );
};

export const getGarageTheme = (value: unknown): GarageKeycapTheme => {
  const parsed = parseJsonish(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return cloneGarageTheme(DEFAULT_GARAGE_PRESET.theme);
  }
  const record = parsed as Record<string, unknown>;
  const fallback = DEFAULT_GARAGE_PRESET.theme;
  const modifier =
    typeof record.modifier === "string" ? record.modifier : fallback.modifier;
  const legacyLegend =
    typeof record.legend === "string" ? record.legend : undefined;
  return {
    base: typeof record.base === "string" ? record.base : fallback.base,
    modifier,
    accent: typeof record.accent === "string" ? record.accent : fallback.accent,
    primaryLegend:
      typeof record.primaryLegend === "string"
        ? record.primaryLegend
        : legacyLegend ?? fallback.primaryLegend,
    secondaryLegend:
      typeof record.secondaryLegend === "string"
        ? record.secondaryLegend
        : readableLegendColor(modifier),
  };
};

export const getGarageSelections = (
  value: unknown,
): Record<GarageSlot, GarageSelection> => {
  const parsed = parseJsonish(value);
  const next = emptyGarageSelections();
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return next;
  const record = parsed as Record<string, unknown>;

  GARAGE_SLOTS.forEach(({ id }) => {
    const selection = record[id];
    if (!selection || typeof selection !== "object" || Array.isArray(selection)) {
      return;
    }
    const selectionRecord = selection as Record<string, unknown>;
    next[id] = {
      productId:
        typeof selectionRecord.productId === "string"
          ? selectionRecord.productId
          : undefined,
      variantId:
        typeof selectionRecord.variantId === "string"
          ? selectionRecord.variantId
          : undefined,
    };
  });

  return next;
};

export const toGarageSelectionsDto = (
  selections: Record<GarageSlot, GarageSelection>,
): GarageSelectionsDto | null => {
  const entries = GARAGE_SLOTS.map(({ id }) => [id, selections[id]] as const);
  if (entries.some(([, selection]) => !selection.productId)) return null;

  return Object.fromEntries(
    entries.map(([slot, selection]) => [
      slot,
      {
        productId: selection.productId as string,
        ...(selection.variantId ? { variantId: selection.variantId } : {}),
      },
    ]),
  ) as unknown as GarageSelectionsDto;
};

export const getGarageBuildSnapshot = (
  value: unknown,
): GarageBuildSnapshot | null => {
  const parsed = parseJsonish(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  const layout = normalizeGarageLayout(record.layout);
  if (
    typeof record.id !== "string" ||
    typeof record.name !== "string" ||
    !layout ||
    typeof record.totalPrice !== "number" ||
    !record.components ||
    typeof record.components !== "object" ||
    Array.isArray(record.components)
  ) {
    return null;
  }
  const selections = toGarageSelectionsDto(getGarageSelections(record.selections));
  if (!selections) return null;

  return {
    id: record.id,
    name: record.name,
    layout,
    theme: getGarageTheme(record.theme),
    selections,
    totalPrice: record.totalPrice,
    components: record.components as Record<GarageSlot, GarageComponentSnapshot>,
  };
};

export const getGarageBuildTheme = (build?: GarageBuildResponseDto | null) =>
  getGarageTheme(build?.theme);
