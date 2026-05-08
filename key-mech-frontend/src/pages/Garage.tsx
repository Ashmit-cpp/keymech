import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import GltfKeyboardViewer from "@/components/gltf-keyboard-viewer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  cloneGarageTheme,
  DEFAULT_GARAGE_PRESET,
  findMatchingPresetId,
  GARAGE_THEME_PRESETS,
  normalizeHexInput,
  type GarageKeycapTheme,
} from "@/lib/garage-theme";

interface HexColorGroupProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
}

function HexColorGroup({ label, hint, value, onChange }: HexColorGroupProps) {
  const baseId = useId();
  const swatchId = `${baseId}-swatch`;
  const hexId = `${baseId}-hex`;
  const [hexDraft, setHexDraft] = useState(value);

  return (
    <div className="space-y-2">
      <Label
        htmlFor={swatchId}
        className="text-xs font-semibold uppercase tracking-widest text-foreground"
      >
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          id={swatchId}
          type="color"
          aria-label={`${label}, color picker`}
          className={cn(
            "min-h-11 min-w-11 shrink-0 cursor-pointer rounded-none border border-foreground bg-transparent p-0.5",
            "md:h-9 md:min-h-9 md:w-12 md:min-w-12",
            "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          id={hexId}
          value={hexDraft}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={() => {
            const n = normalizeHexInput(hexDraft);
            if (n) {
              onChange(n);
              setHexDraft(n);
            } else {
              setHexDraft(value);
            }
          }}
          className={cn(
            "min-h-11 min-w-0 flex-1 rounded-none border-foreground bg-background font-mono text-sm uppercase md:min-h-9",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          spellCheck={false}
          autoCapitalize="off"
          aria-label={`${label}, hex`}
        />
      </div>
      {hint ? (
        <p className="text-xs font-medium text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export default function GaragePage() {
  const [theme, setTheme] = useState<GarageKeycapTheme>(() =>
    cloneGarageTheme(DEFAULT_GARAGE_PRESET.theme),
  );
  const activePresetId = findMatchingPresetId(theme);

  function applyPreset(id: string) {
    const preset = GARAGE_THEME_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setTheme(cloneGarageTheme(preset.theme));
  }

  function resetToDefault() {
    setTheme(cloneGarageTheme(DEFAULT_GARAGE_PRESET.theme));
  }

  function patchTheme(partial: Partial<GarageKeycapTheme>) {
    setTheme((prev) => ({ ...prev, ...partial }));
  }

  return (
    <div className="min-h-screen bg-background pt-14 pb-10">
      <div className="container mx-auto max-w-[1500px] px-4 py-8 lg:py-10">
        {/* Header Section */}
        <header className="mb-8 space-y-5 border-b border-border pb-8 lg:mb-10">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              [Workshop]
            </p>
            <h1 className="font-serif text-5xl font-bold uppercase leading-[0.88] tracking-[-0.035em] text-foreground sm:text-6xl">
              Garage
            </h1>
          </div>

          <p className="max-w-2xl font-medium leading-relaxed text-muted-foreground">
            Try keycap group colors on the 3D board—nothing is saved. Drag or
            swipe the preview to rotate when your device allows motion.
          </p>
        </header>

        {/* Layout Grid */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start xl:gap-10">
          {/* Main 3D Viewer Area - Flex grows to fill space */}
          <Card className="flex-1 overflow-hidden rounded-none border-border bg-background py-0 shadow-none">
            <CardContent className="h-[50vh] min-h-[400px] w-full space-y-0 p-0 lg:h-[calc(100vh-16rem)] lg:min-h-[600px]">
              <section
                aria-labelledby="garage-workspace-title"
                className="relative flex h-full w-full items-center justify-center p-4 sm:p-6"
              >
                <h2 id="garage-workspace-title" className="sr-only">
                  Live preview
                </h2>
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 flex items-center justify-between px-5 pb-5 text-xs font-semibold uppercase tracking-widest text-foreground/50"
                  aria-hidden
                >
                  <span>[Live Preview]</span>
                  <span>[Drag to Rotate]</span>
                </div>
                <GltfKeyboardViewer
                  embedded
                  garageKeycapTheme={theme}
                  isInteractive
                  isHeroKeyboardInView={false}
                />
              </section>
            </CardContent>
          </Card>

          {/* Customization Sidebar - Sticky on Desktop */}
          <aside className="w-full lg:sticky lg:top-24 lg:w-[320px] xl:w-[380px] shrink-0">
            <Card className="rounded-none border-border bg-background shadow-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-2xl font-bold uppercase leading-none tracking-[-0.035em]">
                      Customize
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="rounded-none border-foreground bg-background text-foreground hover:bg-foreground hover:text-background"
                      onClick={resetToDefault}
                      title="Reset to default"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="sr-only">Reset</span>
                    </Button>
                  </div>
                  <CardDescription className="font-medium leading-snug">
                    Build your texture pack: tune base, modifiers, accent, and
                    legends.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pb-6">
                {/* Presets */}
                <div className="space-y-3" role="group" aria-label="Colorway presets">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    [Colorway Presets]
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {GARAGE_THEME_PRESETS.map((p) => (
                      <Button
                        key={p.id}
                        type="button"
                        variant={activePresetId === p.id ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 rounded-none text-xs uppercase tracking-[0.12em] transition-colors",
                          activePresetId === p.id
                            ? "bg-foreground text-background hover:bg-primary"
                            : "border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
                        )}
                        onClick={() => applyPreset(p.id)}
                      >
                        {p.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Color Controls */}
                <div className="space-y-5">
                  <HexColorGroup
                    key={`base-${theme.base}`}
                    label="Base"
                    hint="Alphas & number row"
                    value={theme.base}
                    onChange={(next) => patchTheme({ base: next })}
                  />
                  <HexColorGroup
                    key={`modifier-${theme.modifier}`}
                    label="Modifiers"
                    hint="Tab, shifts, F-row, nav"
                    value={theme.modifier}
                    onChange={(next) => patchTheme({ modifier: next })}
                  />
                  <HexColorGroup
                    key={`accent-${theme.accent}`}
                    label="Accent"
                    hint="Enter, space, arrows"
                    value={theme.accent}
                    onChange={(next) => patchTheme({ accent: next })}
                  />
                  <HexColorGroup
                    key={`legend-${theme.legend}`}
                    label="Legend"
                    hint="Reserved for export / future legends"
                    value={theme.legend}
                    onChange={(next) => patchTheme({ legend: next })}
                  />
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
