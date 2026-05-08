import { COLORWAYS } from "@/lib/constants";

export interface GarageKeycapTheme {
  base: string;
  modifier: string;
  accent: string;
  legend: string;
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
    legend: v["--key-legend"],
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
    a.legend === b.legend
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
