import { ROWS } from "@/lib/constants";

/** One CSS “px” in world space: 50px key width = 1 unit. */
export const KEY_UNIT = 1;
/** 2px gap between keys → 0.04 world units. */
export const KEY_GAP = 0.04;

export type KeyCategory = "base" | "mod" | "acc1" | "acc2";

export interface PlacedKey {
  id: string;
  label: string;
  category: KeyCategory;
  /** Logical width in key units (1, 1.25, 6.25, …). */
  units: number;
  /** Footprint width in world units (matches CSS min-width formula). */
  widthWorld: number;
  centerX: number;
  centerZ: number;
  rowIndex: number;
  colIndex: number;
}

/** Matches CSS: (50+2)*u - 2 px → (KEY_UNIT+KEY_GAP)*u - KEY_GAP. */
export function footprintWidthWorld(units: number): number {
  return (KEY_UNIT + KEY_GAP) * units - KEY_GAP;
}

function parseUnitsFromWidthClass(wCls: string | undefined): number {
  if (!wCls) return 1;
  const m = wCls.match(/\bw(\d+)/);
  if (!m) return 1;
  return parseInt(m[1], 10) / 100;
}

function parseCategory(cls: string | undefined): KeyCategory {
  const token = (cls ?? "base").split(" ")[0];
  if (
    token === "base" ||
    token === "mod" ||
    token === "acc1" ||
    token === "acc2"
  ) {
    return token;
  }
  return "base";
}

const ROW_STEP = KEY_UNIT + KEY_GAP;

/**
 * Flatten `ROWS` into positioned keys; centers the board at origin on X/Z.
 */
export function buildKeyboardLayout(): PlacedKey[] {
  const placed: PlacedKey[] = [];

  for (let ri = 0; ri < ROWS.length; ri++) {
    const row = ROWS[ri];
    let xCursor = 0;

    for (let ci = 0; ci < row.length; ci++) {
      const cell = row[ci];
      const [label, cls, wCls] = cell;

      if (cls === "sp") {
        const spW = wCls ? parseInt(wCls.replace("w", ""), 10) : 10;
        xCursor += spW / 50;
        continue;
      }

      if (label === "" && !wCls) {
        xCursor += 10 / 50;
        continue;
      }

      const units = parseUnitsFromWidthClass(wCls);
      const widthWorld = footprintWidthWorld(units);
      const centerX = xCursor + widthWorld / 2;
      xCursor += widthWorld + KEY_GAP;

      placed.push({
        id: `${ri}-${ci}`,
        label,
        category: parseCategory(cls),
        units,
        widthWorld,
        centerX,
        centerZ: -ri * ROW_STEP,
        rowIndex: ri,
        colIndex: ci,
      });
    }
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const k of placed) {
    const halfW = k.widthWorld / 2;
    minX = Math.min(minX, k.centerX - halfW);
    maxX = Math.max(maxX, k.centerX + halfW);
    minZ = Math.min(minZ, k.centerZ - KEY_UNIT / 2);
    maxZ = Math.max(maxZ, k.centerZ + KEY_UNIT / 2);
  }

  const midX = (minX + maxX) / 2;
  const midZ = (minZ + maxZ) / 2;
  for (const k of placed) {
    k.centerX -= midX;
    k.centerZ -= midZ;
  }

  return placed;
}

export function groupKeysByUnits(keys: PlacedKey[]): Map<number, PlacedKey[]> {
  const map = new Map<number, PlacedKey[]>();
  for (const k of keys) {
    const list = map.get(k.units) ?? [];
    list.push(k);
    map.set(k.units, list);
  }
  return map;
}
