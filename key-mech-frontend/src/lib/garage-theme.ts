import { COLORWAYS } from "@/lib/constants";

export interface GarageKeycapTheme {
  base: string;
  modifier: string;
  accent: string;
  primaryLegend: string;
  secondaryLegend: string;
}

export interface GarageThemePreset {
  id: string;
  name: string;
  style?: string;
  theme: GarageKeycapTheme;
}

export function cloneGarageTheme(theme: GarageKeycapTheme): GarageKeycapTheme {
  return { ...theme };
}

export function garageThemeFromColorway(
  cw: (typeof COLORWAYS)[number],
): GarageKeycapTheme {
  const v = cw.vars;
  return {
    base: v["--key-base"],
    modifier: v["--key-mod"],
    accent: v["--key-accent1"],
    primaryLegend: v["--key-legend"],
    secondaryLegend: v["--key-mod-legend"],
  };
}

export const GARAGE_THEME_PRESETS: GarageThemePreset[] = COLORWAYS.map(
  (cw) => ({
    id: cw.id,
    name: cw.name,
    style: cw.style,
    theme: garageThemeFromColorway(cw),
  }),
);

export const DEFAULT_GARAGE_PRESET: GarageThemePreset =
  GARAGE_THEME_PRESETS[0]!;

export function garageThemesEqual(
  a: GarageKeycapTheme,
  b: GarageKeycapTheme,
): boolean {
  return (
    a.base === b.base &&
    a.modifier === b.modifier &&
    a.accent === b.accent &&
    a.primaryLegend === b.primaryLegend &&
    a.secondaryLegend === b.secondaryLegend
  );
}

/** Returns a preset id when `theme` matches a bundled colorway, else null (Custom). */
export function findMatchingPresetId(theme: GarageKeycapTheme): string | null {
  const match = GARAGE_THEME_PRESETS.find((p) => garageThemesEqual(p.theme, theme));
  return match?.id ?? null;
}

/** Accepts #RGB or #RRGGBB (case-insensitive). Returns lowercase #RRGGBB or null. */
export function normalizeHexInput(value: string): string | null {
  const s = value.trim();
  const six = /^#([0-9a-f]{6})$/i.exec(s);
  if (six) return `#${six[1].toLowerCase()}`;
  const three = /^#([0-9a-f]{3})$/i.exec(s);
  if (three) {
    const t = three[1];
    return `#${t[0]}${t[0]}${t[1]}${t[1]}${t[2]}${t[2]}`.toLowerCase();
  }
  return null;
}

const DARK_LEGEND = "#101820";
const LIGHT_LEGEND = "#f8f8f2";

function relativeLuminance(color: string): number | null {
  const normalized = normalizeHexInput(color);
  if (!normalized) return null;
  const channels = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a: number, b: number): number {
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export function readableLegendColor(background: string): string {
  const backgroundLuminance = relativeLuminance(background);
  const darkLuminance = relativeLuminance(DARK_LEGEND)!;
  const lightLuminance = relativeLuminance(LIGHT_LEGEND)!;
  if (backgroundLuminance === null) return DARK_LEGEND;
  return contrastRatio(backgroundLuminance, lightLuminance) >=
    contrastRatio(backgroundLuminance, darkLuminance)
    ? LIGHT_LEGEND
    : DARK_LEGEND;
}
