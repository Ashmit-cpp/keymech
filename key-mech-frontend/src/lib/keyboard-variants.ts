/** ANSI footprints in 19.05 mm switch-pitch units. X/Y describe top-left edges. */
export type KeyboardVariant = "60" | "TKL" | "FULL";
export const SWITCH_PITCH = 0.01905;
export const KEYCAP_GAP = 0.00095;
export interface VariantKey {
  id: string;
  source: string;
  x: number;
  y: number;
  units: number;
  legend?: string;
  heightUnits: number;
  colorRole?: "base" | "modifier" | "accent";
}
export interface KeyCluster { x: number; y: number; width: number; height: number }
export interface VariantLayout {
  keys: VariantKey[];
  width: number;
  height: number;
  clusters: KeyCluster[];
}

export function buildVariantLayout(variant: KeyboardVariant): VariantLayout {
  const keys: VariantKey[] = [];
  const top = variant !== "60" ? 1.5 : 0;
  const add = (id: string, x: number, y: number, units = 1, source = id, legend?: string, heightUnits = 1, colorRole?: VariantKey["colorRole"]) =>
    keys.push({ id, source: `K_${source.toUpperCase()}`, x, y, units, legend, heightUnits, colorRole });
  const row = (y: number, entries: (string | [string, number])[]) => {
    let x = 0;
    entries.forEach((entry) => {
      const [id, units] = typeof entry === "string" ? [entry, 1] : entry;
      add(id, x, y + top, units);
      x += units;
    });
  };
  row(0, [variant === "60" ? "esc" : "grave", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "dash", "equal", ["backspace", 2]]);
  row(1, [["tab", 1.5], "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "lsquarebracket", "rsquarebracket", ["backslash", 1.5]]);
  row(2, [["caps", 1.75], "a", "s", "d", "f", "g", "h", "j", "k", "l", "semicolon", "quote", ["enter", 2.25]]);
  row(3, [["lshift", 2.25], "z", "x", "c", "v", "b", "n", "m", "comma", "period", "slash", ["rshift", 2.75]]);
  row(4, [["lcontrol", 1.25], ["lwin", 1.25], ["lalt", 1.25], ["space", 6.25], ["ralt", 1.25]]);
  add(variant === "60" ? "fn" : "rwin", 11.25, top + 4, 1.25, variant === "60" ? "fn" : "lwin");
  add("menu", 12.5, top + 4, 1.25, "fn", "Menu");
  add("rcontrol", 13.75, top + 4, 1.25, "lcontrol");
  // The source 75% uses a different modifier arrangement and a shorter right Shift.
  const legends: Record<string, string> = { lcontrol: "CTRL", lwin: "CMD", lalt: "OPT", ralt: "OPT", rwin: "CMD", rcontrol: "CTRL", fn: "FN", rshift: "SHIFT" };
  keys.forEach((key) => { if (legends[key.id]) key.legend = legends[key.id]; });
  const clusters: KeyCluster[] = [{ x: 0, y: top, width: 15, height: 5 }];
  if (variant !== "60") {
    add("esc", 0, 0);
    clusters.push({ x: 0, y: 0, width: 1, height: 1 });
    for (let group = 0; group < 3; group++) {
      const x = 2 + group * 4.5;
      clusters.push({ x, y: 0, width: 4, height: 1 });
      for (let i = 0; i < 4; i++) add(`f${group * 4 + i + 1}`, x + i, 0);
    }
    ["PrtSc", "ScrLk", "Pause"].forEach((legend, i) => add(["printscreen", "scrolllock", "pause"][i], 15.5 + i, 0, 1, "del", legend));
    add("insert", 15.5, top, 1, "del", "Insert");
    add("home", 16.5, top, 1, "del", "Home");
    add("pageup", 17.5, top, 1, "del");
    add("del", 15.5, top + 1, 1, "q");
    add("end", 16.5, top + 1, 1, "q");
    add("pagedown", 17.5, top + 1, 1, "q");
    add("arrowup", 16.5, top + 3);
    ["arrowleft", "arrowdown", "arrowright"].forEach((id, i) => add(id, 15.5 + i, top + 4));
    clusters.push(
      { x: 15.5, y: 0, width: 3, height: 1 },
      { x: 15.5, y: top, width: 3, height: 2 },
      { x: 16.5, y: top + 3, width: 1, height: 1 },
      { x: 15.5, y: top + 4, width: 3, height: 1 },
    );
  }
  if (variant === "FULL") {
    // ANSI 104: 17-key numpad, separated from navigation by the same half-unit gutter.
    // Digits/decimal continue the alpha color, operators the modifiers, Enter the accent.
    const num = (id: string, x: number, y: number, legend: string, source: string,
      role: VariantKey["colorRole"] = "base", width = 1, height = 1) =>
      add(`num${id}`, 19 + x, top + y, width, source, legend, height, role);
    num("lock", 0, 0, "Num\nLock", "del", "modifier");
    num("divide", 1, 0, "/", "del", "modifier");
    num("multiply", 2, 0, "*", "del", "modifier");
    num("subtract", 3, 0, "−", "del", "modifier");
    num("7", 0, 1, "7\nHome", "q");
    num("8", 1, 1, "8\n↑", "q");
    num("9", 2, 1, "9\nPgUp", "q");
    num("add", 3, 1, "+", "q", "modifier", 1, 2);
    num("4", 0, 2, "4\n←", "a");
    num("5", 1, 2, "5", "f");
    num("6", 2, 2, "6\n→", "a");
    num("1", 0, 3, "1\nEnd", "z");
    num("2", 1, 3, "2\n↓", "z");
    num("3", 2, 3, "3\nPgDn", "z");
    num("enter", 3, 3, "Enter", "z", "accent", 1, 2);
    num("0", 0, 4, "0\nIns", "z", "base", 2);
    num("decimal", 2, 4, ".\nDel", "z");
    clusters.push({ x: 19, y: top, width: 4, height: 5 });
  }
  const additionalLegends: Record<string, string> = { backslash: "\\", f11: "F11", f12: "F12", pageup: "PgUp", pagedown: "PgDn", del: "Del", end: "End" };
  keys.forEach((key) => { if (additionalLegends[key.id]) key.legend = additionalLegends[key.id]; });
  return { keys, width: variant === "FULL" ? 23 : variant === "TKL" ? 18.5 : 15, height: top + 5, clusters };
}
