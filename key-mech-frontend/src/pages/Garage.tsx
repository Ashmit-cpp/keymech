import { useEffect, useId, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Info,
  RotateCcw,
  Save,
  Share2,
  ShoppingCart,
  Box,
  Layers,
  Grid,
  Zap,
  Sparkles,
  PlusCircle,
  Keyboard,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ZoomIn,
  Move,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCartControllerGetCartQueryKey,
  getGarageControllerFindMeQueryKey,
  type GarageBuildResponseDto,
  type ProductResponseDto,
  type ProductVariantResponseDto,
  useCartControllerAddGarageBuild,
  useGarageControllerCreate,
  useGarageControllerFindOne,
  useGarageControllerUpdate,
  useProductsControllerFindAll,
} from "@/api/generated";
import GltfKeyboardViewer from "@/components/lazy-gltf-keyboard-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  GARAGE_SLOTS,
  supportsGarageLayout,
  toGarageSelectionsDto,
  type GarageLayout,
  type GarageSlot,
} from "@/lib/garage";
import {
  cloneGarageTheme,
  findMatchingPresetId,
  GARAGE_THEME_PRESETS,
  normalizeHexInput,
  type GarageKeycapTheme,
} from "@/lib/garage-theme";
import { formatINR } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useGarageStore } from "@/stores/garage-store";

interface HexColorGroupProps {
  label: string;
  value: string;
  onChange: (next: string) => void;
}

function HexColorGroup({ label, value, onChange }: HexColorGroupProps) {
  const baseId = useId();
  const swatchId = `${baseId}-swatch`;
  const hexId = `${baseId}-hex`;
  const [hexDraft, setHexDraft] = useState(value);

  useEffect(() => {
    setHexDraft(value);
  }, [value]);

  return (
    <div className="space-y-1">
      <Label
        htmlFor={swatchId}
        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          id={swatchId}
          type="color"
          aria-label={`${label} color`}
          className="h-8 w-8 shrink-0 cursor-pointer border border-border bg-transparent p-0.5 rounded-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          id={hexId}
          value={hexDraft}
          onChange={(event) => setHexDraft(event.target.value)}
          onBlur={() => {
            const normalized = normalizeHexInput(hexDraft);
            if (normalized) onChange(normalized);
            setHexDraft(normalized ?? value);
          }}
          className="h-8 border-border font-mono text-xs uppercase rounded-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function selectedVariant(
  product: ProductResponseDto | undefined,
  variantId?: string,
) {
  if (!product || !variantId) return null;
  return product.variants.find((variant) => variant.id === variantId) ?? null;
}

function productUnitPrice(
  product: ProductResponseDto | undefined,
  variant: ProductVariantResponseDto | null,
) {
  return product ? product.price + (variant?.extraPrice ?? 0) : 0;
}

export default function GaragePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editBuildId = searchParams.get("buildId");
  const { isAuthenticated } = useAuthStore();

  // Redesign state: tabs
  const [activeTab, setActiveTab] = useState<
    "layout" | "keycaps" | "switches" | "case" | "plate" | "lighting" | "extras"
  >("layout");

  // Redesign state: 3D controls
  const [viewMode, setViewMode] = useState<"3d" | "explode" | "top" | "side" | "front">("3d");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Sync active slot with active tab for queries
  const activeSlot = useMemo<GarageSlot>(() => {
    if (activeTab === "keycaps") return "keycaps";
    if (activeTab === "switches") return "switches";
    if (activeTab === "case") return "case";
    if (activeTab === "plate") return "plate";
    return "case"; // Fallback/default slot
  }, [activeTab]);

  const {
    name,
    layout,
    selections,
    theme,
    compatibilityErrors,
    totalPrice,
    savedBuildId,
    isPublic,
    dirty,
    setLayout,
    setSelection,
    setTheme,
    setCompatibilityErrors,
    setTotalPrice,
    loadBuild,
    markSaved,
    reset,
  } = useGarageStore();

  const caseQuery = useProductsControllerFindAll(
    { search: "", category: "KEYBOARD" },
    { query: { queryKey: ["garage-products", "KEYBOARD"] } },
  );
  const pcbQuery = useProductsControllerFindAll(
    { search: "", category: "PCB" },
    { query: { queryKey: ["garage-products", "PCB"] } },
  );
  const plateQuery = useProductsControllerFindAll(
    { search: "", category: "PLATE" },
    { query: { queryKey: ["garage-products", "PLATE"] } },
  );
  const switchQuery = useProductsControllerFindAll(
    { search: "", category: "SWITCH" },
    { query: { queryKey: ["garage-products", "SWITCH"] } },
  );
  const keycapQuery = useProductsControllerFindAll(
    { search: "", category: "KEYCAP" },
    { query: { queryKey: ["garage-products", "KEYCAP"] } },
  );
  const stabilizerQuery = useProductsControllerFindAll(
    { search: "", category: "STABILIZER" },
    { query: { queryKey: ["garage-products", "STABILIZER"] } },
  );

  const editBuild = useGarageControllerFindOne(editBuildId, {
    query: { enabled: Boolean(editBuildId) },
  });
  const createBuild = useGarageControllerCreate();
  const updateBuild = useGarageControllerUpdate();
  const addGarageBuild = useCartControllerAddGarageBuild();
  const isMutating =
    createBuild.status === "pending" ||
    updateBuild.status === "pending" ||
    addGarageBuild.status === "pending";

  useEffect(() => {
    const build = editBuild.data?.data;
    if (build && savedBuildId !== build.id) {
      loadBuild(build);
    }
  }, [editBuild.data?.data, loadBuild, savedBuildId]);

  const productsBySlot = useMemo(
    () => ({
      case: caseQuery.data?.data ?? [],
      pcb: pcbQuery.data?.data ?? [],
      plate: plateQuery.data?.data ?? [],
      switches: switchQuery.data?.data ?? [],
      keycaps: keycapQuery.data?.data ?? [],
      stabilizers: stabilizerQuery.data?.data ?? [],
    }),
    [
      caseQuery.data?.data,
      keycapQuery.data?.data,
      pcbQuery.data?.data,
      plateQuery.data?.data,
      stabilizerQuery.data?.data,
      switchQuery.data?.data,
    ],
  );

  const selectedProducts = useMemo(() => {
    return Object.fromEntries(
      GARAGE_SLOTS.map(({ id }) => {
        const selection = selections[id];
        const product = productsBySlot[id].find(
          (item) => item.id === selection.productId,
        );
        const variant = selectedVariant(product, selection.variantId);
        return [id, { product, variant }];
      }),
    ) as Record<
      GarageSlot,
      { product?: ProductResponseDto; variant: ProductVariantResponseDto | null }
    >;
  }, [productsBySlot, selections]);

  const derived = useMemo(() => {
    const errors: string[] = [];
    let total = 0;

    GARAGE_SLOTS.forEach(({ id, label }) => {
      const { product, variant } = selectedProducts[id];
      if (!product) {
        errors.push(`${label} is required`);
        return;
      }

      if (
        ["case", "pcb", "plate", "keycaps"].includes(id) &&
        !supportsGarageLayout(product, layout, variant)
      ) {
        errors.push(`${label} does not support ${layout}`);
      }

      total += productUnitPrice(product, variant);
    });

    return { errors, total };
  }, [layout, selectedProducts]);

  useEffect(() => {
    setCompatibilityErrors(derived.errors);
    setTotalPrice(derived.total);
  }, [derived.errors, derived.total, setCompatibilityErrors, setTotalPrice]);

  const activeProducts = productsBySlot[activeSlot];
  const activeSelection = selections[activeSlot];
  const activePresetId = findMatchingPresetId(theme);

  const isComplete = GARAGE_SLOTS.every(({ id }) => selections[id].productId);
  const isValid = isComplete && compatibilityErrors.length === 0;

  const filteredActiveProducts = useMemo(
    () =>
      activeProducts.filter((product) => {
        const variant = selectedVariant(
          product,
          product.id === activeSelection.productId
            ? activeSelection.variantId
            : undefined,
        );
        const fallbackVariant = variant ?? product.variants[0] ?? null;
        return supportsGarageLayout(product, layout, fallbackVariant);
      }),
    [activeProducts, activeSelection.productId, activeSelection.variantId, layout],
  );



  function patchTheme(partial: Partial<GarageKeycapTheme>) {
    setTheme({ ...theme, ...partial });
  }

  function selectProduct(slot: GarageSlot, product: ProductResponseDto) {
    const compatibleVariant =
      product.variants.find((variant) =>
        supportsGarageLayout(product, layout, variant),
      ) ?? product.variants[0];
    setSelection(slot, {
      productId: product.id,
      variantId: compatibleVariant?.id,
    });
  }

  function requireAuth() {
    if (isAuthenticated) return true;
    toast.info("Please sign in to save Garage builds");
    navigate("/auth/login");
    return false;
  }

  async function saveBuild(): Promise<GarageBuildResponseDto> {
    if (!requireAuth()) throw new Error("Authentication required");
    const dtoSelections = toGarageSelectionsDto(selections);
    if (!dtoSelections || !isValid) {
      toast.error("Complete the build before saving");
      throw new Error("Garage build is incomplete");
    }

    const payload = {
      name: name.trim() || "Untitled Garage Build",
      layout,
      selections: dtoSelections,
      theme: { ...theme } as Record<string, unknown>,
    };

    const response = savedBuildId
      ? await updateBuild.mutateAsync({
          id: savedBuildId,
          data: payload,
        })
      : await createBuild.mutateAsync({
          data: {
            ...payload,
            isPublic: false,
          },
        });

    markSaved(response.data);
    queryClient.invalidateQueries({
      queryKey: getGarageControllerFindMeQueryKey(),
    });
    toast.success("Garage build saved");
    return response.data;
  }

  async function shareBuild() {
    try {
      const build = !savedBuildId || dirty ? await saveBuild() : null;
      const id = build?.id ?? savedBuildId;
      if (!id) return;

      const publicBuild =
        build?.isPublic || isPublic
          ? build
          : (
              await updateBuild.mutateAsync({
                id,
                data: { isPublic: true },
              })
            ).data;

      if (publicBuild) markSaved(publicBuild);
      const url = `${window.location.origin}/garage/builds/${id}`;
      await navigator.clipboard?.writeText(url);
      toast.success("Share URL copied");
    } catch (error) {
      if (error instanceof Error && error.message === "Authentication required") {
        return;
      }
      toast.error("Failed to share Garage build");
    }
  }

  async function addBuildToCart() {
    try {
      if (!requireAuth()) return;
      const build = !savedBuildId || dirty ? await saveBuild() : null;
      const id = build?.id ?? savedBuildId;
      if (!id) return;

      await addGarageBuild.mutateAsync({
        data: { garageBuildId: id, quantity: 1 },
      });
      await queryClient.invalidateQueries({
        queryKey: getCartControllerGetCartQueryKey(),
      });
      toast.success("Garage bundle added to cart");
    } catch (error) {
      if (error instanceof Error && error.message === "Authentication required") {
        return;
      }
      toast.error("Failed to add Garage bundle");
    }
  }

  // Swatch colors extraction helpers
  const selectedCaseColor = useMemo(() => {
    const { variant } = selectedProducts.case;
    if (!variant) return "#888888";
    if (variant.name.toLowerCase().includes("white")) return "#EAEAEA";
    if (variant.name.toLowerCase().includes("black")) return "#1A1A1A";
    return "#555555";
  }, [selectedProducts.case]);

  const selectedSwitchesColor = useMemo(() => {
    const { product } = selectedProducts.switches;
    if (!product) return "#888888";
    if (product.slug.includes("milky-yellow")) return "#FFDE59";
    if (product.slug.includes("cherry-mx2a-rgb-black")) return "#2A2A2A";
    return "#888888";
  }, [selectedProducts.switches]);

  const selectedPlateColor = useMemo(() => {
    const { variant } = selectedProducts.plate;
    if (!variant) return "#888888";
    const name = variant.name.toLowerCase();
    if (name.includes("pc") || name.includes("polycarbonate")) return "#E2E8F0";
    if (name.includes("fr4")) return "#2B2B2B";
    if (name.includes("brass")) return "#C5A059";
    if (name.includes("aluminum")) return "#D3D3D3";
    return "#888888";
  }, [selectedProducts.plate]);

  // Featured builds local database matching presets
  const FEATURED_BUILDS = [
    {
      id: "claude",
      name: "Claude",
      layout: "75" as const,
      caseSku: "KM-Q1MAX-BB-WHT",
      pcbSku: "GARAGE-PCB-75-HS",
      plateSku: "GARAGE-PLATE-75-PC",
      switchSku: "GAT-KS3-MY-PRO-110",
      keycapSku: "KC-OSA-PBT-RETRO-141",
      stabSku: "KC-STAB-GOLD-SCREWIN-10",
      theme: { base: "#ffffff", modifier: "#7277a9", accent: "#ff79c6", legend: "#050505" },
      image: "https://www.keychron.com/cdn/shop/files/Keychron-Q1-Max-QMK-VIA-Wireless-Custom-Mechanical-Keyboard-75_-Layout-Aluminum-Black-Fully-Assembled-Knob-for-Mac-Windows-Linux-Gateron-Jupiter-Red.jpg?v=1753685590&width=150",
    },
    {
      id: "gemini",
      name: "Gemini",
      layout: "75" as const,
      caseSku: "KM-Q1MAX-BB-BLK",
      pcbSku: "GARAGE-PCB-75-HS",
      plateSku: "GARAGE-PLATE-75-PC",
      switchSku: "GAT-KS3-MY-PRO-110",
      keycapSku: "KC-OSA-PBT-WOB-141",
      stabSku: "KC-STAB-GOLD-SCREWIN-10",
      theme: { base: "#1a1b2e", modifier: "#3d59a1", accent: "#7aa2f7", legend: "#c0cff7" },
      image: "https://www.keychron.com/cdn/shop/files/Keychron-Q1-Max-QMK-VIA-Wireless-Custom-Mechanical-Keyboard-75_-Layout-Aluminum-Black-Fully-Assembled-Knob-for-Mac-Windows-Linux-Gateron-Jupiter-Red.jpg?v=1753685590&width=150",
    },
    {
      id: "sakura",
      name: "Sakura",
      layout: "75" as const,
      caseSku: "KM-Q1MAX-BB-WHT",
      pcbSku: "GARAGE-PCB-75-HS",
      plateSku: "GARAGE-PLATE-75-PC",
      switchSku: "GAT-KS3-MY-PRO-110",
      keycapSku: "KC-OSA-PBT-RETRO-141",
      stabSku: "KC-STAB-GOLD-SCREWIN-10",
      theme: { base: "#ffd1dc", modifier: "#d4145a", accent: "#ffffff", legend: "#4a0e30" },
      image: "https://www.keychron.com/cdn/shop/files/Keychron-Q1-Max-QMK-VIA-Wireless-Custom-Mechanical-Keyboard-75_-Layout-Aluminum-Black-Fully-Assembled-Knob-for-Mac-Windows-Linux-Gateron-Jupiter-Red.jpg?v=1753685590&width=150",
    },
    {
      id: "cream-dream",
      name: "Cream Dream",
      layout: "65" as const,
      caseSku: "KM-Q2MAX-BB-WHT",
      pcbSku: "GARAGE-PCB-65-HS",
      plateSku: "GARAGE-PLATE-65-PC",
      switchSku: "GAT-KS3-MY-PRO-45",
      keycapSku: "KC-OSA-PBT-RETRO-141",
      stabSku: "KC-STAB-GOLD-SCREWIN-10",
      theme: { base: "#f0d5c0", modifier: "#b87045", accent: "#e6db74", legend: "#2e2e2e" },
      image: "https://www.keychron.com/cdn/shop/files/Keychron-Q2-Max-QMK-VIA-Wireless-Custom-Mechanical-Keyboard-65_-Layout-Aluminum-Black-Fully-Assembled-Knob-for-Mac-Windows-Linux-Gateron-Jupiter-Red.jpg?v=1754098803&width=150",
    },
    {
      id: "olive-green",
      name: "Olive Green",
      layout: "TKL" as const,
      caseSku: "KM-V3MAX-BB-BLK",
      pcbSku: "GARAGE-PCB-TKL-HS",
      plateSku: "GARAGE-PLATE-TKL-PC",
      switchSku: "CHERRY-MX2A-BLK-110",
      keycapSku: "KC-CHERRY-PBT-DOLCH-143",
      stabSku: "KC-STAB-GOLD-SCREWIN-10",
      theme: { base: "#5f7d53", modifier: "#2d3d26", accent: "#a6e22e", legend: "#ffffff" },
      image: "https://www.keychron.com/cdn/shop/products/Gateron-KS-3-Milky-Yellow-Pro-Switch-Set.jpg?v=1664419753&width=150",
    },
    {
      id: "ocean-blue",
      name: "Ocean Blue",
      layout: "75" as const,
      caseSku: "KM-Q1MAX-BB-BLK",
      pcbSku: "GARAGE-PCB-75-HS",
      plateSku: "GARAGE-PLATE-75-PC",
      switchSku: "GAT-KS3-MY-PRO-110",
      keycapSku: "KC-CHERRY-PBT-BBY-143",
      stabSku: "KC-STAB-GOLD-SCREWIN-10",
      theme: { base: "#e0f7fa", modifier: "#00b0ff", accent: "#ffffff", legend: "#001b29" },
      image: "https://www.keychron.com/cdn/shop/files/Keychron-Q1-Max-QMK-VIA-Wireless-Custom-Mechanical-Keyboard-75_-Layout-Aluminum-Black-Fully-Assembled-Knob-for-Mac-Windows-Linux-Gateron-Jupiter-Red.jpg?v=1753685590&width=150",
    },
  ];

  const [activeBuildId, setActiveBuildId] = useState<string>("gemini");

  const applyFeaturedBuild = (build: (typeof FEATURED_BUILDS)[number]) => {
    setActiveBuildId(build.id);
    const cases = caseQuery.data?.data ?? [];
    const pcbs = pcbQuery.data?.data ?? [];
    const plates = plateQuery.data?.data ?? [];
    const switches = switchQuery.data?.data ?? [];
    const keycaps = keycapQuery.data?.data ?? [];
    const stabilizers = stabilizerQuery.data?.data ?? [];

    const targetCase = cases.find((c) => c.variants.some((v) => v.sku === build.caseSku));
    const targetCaseVariant = targetCase?.variants.find((v) => v.sku === build.caseSku);

    const targetPcb = pcbs.find((p) => p.variants.some((v) => v.sku === build.pcbSku));
    const targetPcbVariant = targetPcb?.variants.find((v) => v.sku === build.pcbSku);

    const targetPlate = plates.find((p) => p.variants.some((v) => v.sku === build.plateSku));
    const targetPlateVariant = targetPlate?.variants.find((v) => v.sku === build.plateSku);

    const targetSwitch = switches.find((s) => s.variants.some((v) => v.sku === build.switchSku));
    const targetSwitchVariant = targetSwitch?.variants.find((v) => v.sku === build.switchSku);

    const targetKeycap = keycaps.find((k) => k.variants.some((v) => v.sku === build.keycapSku));
    const targetKeycapVariant = targetKeycap?.variants.find((v) => v.sku === build.keycapSku);

    const targetStab = stabilizers.find((s) => s.variants.some((v) => v.sku === build.stabSku));
    const targetStabVariant = targetStab?.variants.find((v) => v.sku === build.stabSku);

    setLayout(build.layout);
    if (targetCase) setSelection("case", { productId: targetCase.id, variantId: targetCaseVariant?.id });
    if (targetPcb) setSelection("pcb", { productId: targetPcb.id, variantId: targetPcbVariant?.id });
    if (targetPlate) setSelection("plate", { productId: targetPlate.id, variantId: targetPlateVariant?.id });
    if (targetSwitch) setSelection("switches", { productId: targetSwitch.id, variantId: targetSwitchVariant?.id });
    if (targetKeycap) setSelection("keycaps", { productId: targetKeycap.id, variantId: targetKeycapVariant?.id });
    if (targetStab) setSelection("stabilizers", { productId: targetStab.id, variantId: targetStabVariant?.id });

    setTheme(cloneGarageTheme(build.theme));
    toast.info(`Loaded Featured Build: ${build.name}`);
  };

  // Carousel ref and scrolling helpers
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const offset = direction === "left" ? -200 : 200;
      carouselRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Tab-specific options renderer (shared between desktop and mobile sidebars)
  const renderTabOptions = (tab: typeof activeTab) => {
    switch (tab) {
      case "layout":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Layout
              </h2>
              <h3 className="text-xl font-bold tracking-tight mt-1">Size</h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "65",
                  title: "60% Compact",
                  desc: "62 keys · No arrows, pure minimal",
                  price: 1742900,
                },
                {
                  id: "65-std",
                  title: "65% Standard",
                  desc: "66 keys · Arrows and nav column",
                  price: 1742900,
                },
                {
                  id: "75",
                  title: "75% Pro",
                  desc: "68 keys · Nav column and rotary knob",
                  price: 1576900,
                },
                {
                  id: "TKL",
                  title: "TKL Tenkeyless",
                  desc: "87 keys · Standard function row",
                  price: 786400,
                },
              ].map((item) => {
                const normalizedId = item.id.includes("65") ? "65" : (item.id as GarageLayout);
                const isSelected = layout === normalizedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "w-full text-left p-4 rounded-none border transition-all flex justify-between items-center bg-card text-card-foreground",
                      isSelected
                        ? "border-foreground bg-accent/20"
                        : "border-border hover:border-zinc-400"
                    )}
                    onClick={() => setLayout(normalizedId)}
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <span className="font-semibold text-xs shrink-0 ml-2">
                      {formatINR(item.price)}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed pt-2">
              Switching size rebuilds the board live. The knob is exclusive to 75%.
            </p>
          </div>
        );

      case "plate":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Plate
              </h2>
              <h3 className="text-xl font-bold tracking-tight mt-1">Plate material</h3>
            </div>

            <div className="space-y-3">
              {activeProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading plate options...</p>
              ) : (
                filteredActiveProducts.map((product) => {
                  const isSelected = product.id === activeSelection.productId;
                  const variant = selectedVariant(
                    product,
                    isSelected ? activeSelection.variantId : undefined,
                  );
                  const displayVariant = variant ?? product.variants[0] ?? null;
                  const compatible = supportsGarageLayout(product, layout, displayVariant);

                  // Material colors for circles
                  const nameLower = product.name.toLowerCase();
                  const color = nameLower.includes("pc") ? "#E2E8F0" : nameLower.includes("fr4") ? "#2B2B2B" : "#C5A059";

                  return (
                    <button
                      key={product.id}
                      type="button"
                      className={cn(
                        "w-full text-left p-4 rounded-none border transition-all flex items-center gap-3 bg-card text-card-foreground",
                        isSelected
                          ? "border-foreground bg-accent/20"
                          : "border-border hover:border-zinc-400",
                        !compatible && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => compatible && selectProduct("plate", product)}
                      disabled={!compatible}
                    >
                      <span
                        className="h-3 w-3 rounded-none border border-zinc-200 block shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-bold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {product.description || "Custom high-quality plate"}
                        </p>
                      </div>
                      <span className="font-semibold text-xs shrink-0 ml-2">
                        {formatINR(productUnitPrice(product, displayVariant))}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed pt-2">
              The plate sits inside the case. Switch to Explode view to see it.
            </p>
          </div>
        );

      case "keycaps":
        const activeColorwayName = activePresetId
          ? GARAGE_THEME_PRESETS.find((p) => p.id === activePresetId)?.name
          : "Custom Colorway";
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Keycaps
                </h2>
                <h3 className="text-xl font-bold tracking-tight mt-1">Colorway</h3>
                <p className="text-sm font-semibold mt-2">{activeColorwayName}</p>
              </div>

              {/* Color swatches */}
              <div className="flex gap-2">
                <span className="h-7 w-7 rounded-none border border-border block" style={{ backgroundColor: theme.base }} title="Base color" />
                <span className="h-7 w-7 rounded-none border border-border block" style={{ backgroundColor: theme.modifier }} title="Modifiers color" />
                <span className="h-7 w-7 rounded-none border border-border block" style={{ backgroundColor: theme.accent }} title="Accent color" />
                <span className="h-7 w-7 rounded-none border border-border block" style={{ backgroundColor: theme.legend }} title="Legends color" />
              </div>

              {/* Visual Keycaps Mock */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/20 border border-border rounded-none">
                <div className="aspect-square border border-border flex flex-col justify-between p-2" style={{ backgroundColor: theme.accent }}>
                  <span className="text-[10px] font-bold" style={{ color: theme.legend }}>Esc</span>
                </div>
                <div className="aspect-square border border-border flex flex-col justify-between p-2" style={{ backgroundColor: theme.base }}>
                  <span className="text-[10px] font-bold" style={{ color: theme.legend }}>A</span>
                </div>
                <div className="col-span-2 h-12 border border-border flex flex-col justify-between p-2" style={{ backgroundColor: theme.accent }}>
                  <span className="text-[10px] font-bold" style={{ color: theme.legend }}>↵ Enter</span>
                </div>
              </div>

              {/* View Keycap Library button */}
              <Button
                type="button"
                className="w-full bg-white text-zinc-950 border border-zinc-950 hover:bg-zinc-100 rounded-none py-5 flex items-center justify-center gap-2 mt-4 font-semibold shadow-sm"
                onClick={() => setIsLibraryOpen(true)}
              >
                View Keycap Library
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            {/* Custom hex colorway pickers below */}
            <Separator />
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Custom Theme Hex
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <HexColorGroup
                  key={`base-${theme.base}`}
                  label="Base Color"
                  value={theme.base}
                  onChange={(next) => patchTheme({ base: next })}
                />
                <HexColorGroup
                  key={`modifier-${theme.modifier}`}
                  label="Modifiers"
                  value={theme.modifier}
                  onChange={(next) => patchTheme({ modifier: next })}
                />
                <HexColorGroup
                  key={`accent-${theme.accent}`}
                  label="Accent Color"
                  value={theme.accent}
                  onChange={(next) => patchTheme({ accent: next })}
                />
                <HexColorGroup
                  key={`legend-${theme.legend}`}
                  label="Legends"
                  value={theme.legend}
                  onChange={(next) => patchTheme({ legend: next })}
                />
              </div>
            </div>
          </div>
        );

      case "switches":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Switches
              </h2>
              <h3 className="text-xl font-bold tracking-tight mt-1">Switch Model</h3>
            </div>

            <div className="space-y-3">
              {filteredActiveProducts.map((product) => {
                const isSelected = product.id === activeSelection.productId;
                const variant = selectedVariant(
                  product,
                  isSelected ? activeSelection.variantId : undefined,
                );
                const displayVariant = variant ?? product.variants[0] ?? null;

                return (
                  <div key={product.id} className="space-y-2">
                    <button
                      type="button"
                      className={cn(
                        "w-full text-left p-4 rounded-none border transition-all flex items-center justify-between bg-card text-card-foreground",
                        isSelected
                          ? "border-foreground bg-accent/20"
                          : "border-border hover:border-zinc-400"
                      )}
                      onClick={() => selectProduct("switches", product)}
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.description || "Linear feedback switches"}
                        </p>
                      </div>
                      <span className="font-semibold text-xs shrink-0 ml-2">
                        {formatINR(productUnitPrice(product, displayVariant))}
                      </span>
                    </button>

                    {isSelected && product.variants.length > 0 && (
                      <div className="pl-4">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Switch Count
                        </Label>
                        <select
                          value={activeSelection.variantId}
                          className="mt-1 block w-full rounded-none border border-border bg-background p-2 text-xs"
                          onChange={(e) =>
                            setSelection("switches", {
                              productId: product.id,
                              variantId: e.target.value,
                            })
                          }
                        >
                          {product.variants.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "case":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Case
              </h2>
              <h3 className="text-xl font-bold tracking-tight mt-1">Case kit</h3>
            </div>

            <div className="space-y-3">
              {filteredActiveProducts.map((product) => {
                const isSelected = product.id === activeSelection.productId;
                const variant = selectedVariant(
                  product,
                  isSelected ? activeSelection.variantId : undefined,
                );
                const displayVariant = variant ?? product.variants[0] ?? null;

                return (
                  <div key={product.id} className="space-y-2">
                    <button
                      type="button"
                      className={cn(
                        "w-full text-left p-4 rounded-none border transition-all flex items-center justify-between bg-card text-card-foreground",
                        isSelected
                          ? "border-foreground bg-accent/20"
                          : "border-border hover:border-zinc-400"
                      )}
                      onClick={() => selectProduct("case", product)}
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.description || "Anodized aluminum case"}
                        </p>
                      </div>
                      <span className="font-semibold text-xs shrink-0 ml-2">
                        {formatINR(productUnitPrice(product, displayVariant))}
                      </span>
                    </button>

                    {isSelected && product.variants.length > 0 && (
                      <div className="pl-4">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Case Color
                        </Label>
                        <select
                          value={activeSelection.variantId}
                          className="mt-1 block w-full rounded-none border border-border bg-background p-2 text-xs"
                          onChange={(e) =>
                            setSelection("case", {
                              productId: product.id,
                              variantId: e.target.value,
                            })
                          }
                        >
                          {product.variants.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "lighting":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Lighting
              </h2>
              <h3 className="text-xl font-bold tracking-tight mt-1">RGB Lighting</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border border-border p-3 rounded-none bg-card text-card-foreground">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">Enable South RGB</p>
                  <p className="text-xs text-muted-foreground">Glow shines south-facing</p>
                </div>
                <Switch checked={true} aria-label="Toggle RGB lighting" className="rounded-none" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">
                  RGB Pattern Preset
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Static Color", "Rainbow Wave", "Breathing Glow", "Color Cycle"].map(
                    (pattern, i) => (
                      <button
                        key={pattern}
                        type="button"
                        className={cn(
                          "text-xs p-3 rounded-none border text-left font-semibold bg-card text-card-foreground",
                          i === 0
                            ? "border-foreground bg-accent/20"
                            : "border-border hover:border-zinc-400"
                        )}
                      >
                        {pattern}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <HexColorGroup
                  label="RGB Underglow Tint"
                  value="#3B82F6"
                  onChange={(next) => {
                    toast.info(`Lighting tint changed to: ${next}`);
                  }}
                />
              </div>
            </div>
          </div>
        );

      case "extras":
        return (
          <div className="space-y-6">
            {/* PCB Sub-section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Extras
                </h2>
                <h3 className="text-sm font-bold uppercase mt-1">PCB Motherboard</h3>
              </div>

              <div className="space-y-2">
                {pcbQuery.data?.data?.map((product) => {
                  const isSelected = selections.pcb.productId === product.id;
                  const compatibleVariant =
                    product.variants.find((v) =>
                      supportsGarageLayout(product, layout, v),
                    ) ?? product.variants[0];

                  return (
                    <button
                      key={product.id}
                      type="button"
                      className={cn(
                        "w-full text-left p-3 rounded-none border transition-all flex items-center justify-between bg-card text-card-foreground",
                        isSelected
                          ? "border-foreground bg-accent/20"
                          : "border-border hover:border-zinc-400"
                      )}
                      onClick={() =>
                        setSelection("pcb", {
                          productId: product.id,
                          variantId: compatibleVariant?.id,
                        })
                      }
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-xs">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {compatibleVariant?.name || "Standard PCB"}
                        </p>
                      </div>
                      <span className="font-bold text-xs shrink-0 ml-2">
                        {formatINR(productUnitPrice(product, compatibleVariant ?? null))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Stabilizers Sub-section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase">Stabilizers</h3>
              </div>

              <div className="space-y-2">
                {stabilizerQuery.data?.data?.map((product) => {
                  const isSelected = selections.stabilizers.productId === product.id;
                  const compatibleVariant = product.variants[0];

                  return (
                    <button
                      key={product.id}
                      type="button"
                      className={cn(
                        "w-full text-left p-3 rounded-none border transition-all flex items-center justify-between bg-card text-card-foreground",
                        isSelected
                          ? "border-foreground bg-accent/20"
                          : "border-border hover:border-zinc-400"
                      )}
                      onClick={() =>
                        setSelection("stabilizers", {
                          productId: product.id,
                          variantId: compatibleVariant?.id,
                        })
                      }
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-xs">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {product.description || "Nylon stabilizers kit"}
                        </p>
                      </div>
                      <span className="font-bold text-xs shrink-0 ml-2">
                        {formatINR(productUnitPrice(product, compatibleVariant ?? null))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-background pt-16">
      {/* 1. Desktop Left Sidebar (CONFIGURE menu, Dark Themed) */}
      <aside className="hidden md:flex z-10 w-64 shrink-0 flex-col border-r border-border bg-secondary text-secondary-foreground p-5 justify-between">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-foreground/50">
              [CONFIGURATOR]
            </span>
            <h2 className="text-xl font-bold uppercase tracking-wider text-secondary-foreground mt-1">
              Configure
            </h2>
          </div>

          <nav className="space-y-1">
            {[
              { id: "layout", label: "Layout", icon: Keyboard, swatch: null, badge: `${layout}%` },
              { id: "keycaps", label: "Keycaps", icon: Grid, swatch: theme.accent, badge: null },
              { id: "switches", label: "Switches", icon: Zap, swatch: selectedSwitchesColor, badge: null },
              { id: "case", label: "Case", icon: Box, swatch: selectedCaseColor, badge: null },
              { id: "plate", label: "Plate", icon: Layers, swatch: selectedPlateColor, badge: null },
              { id: "lighting", label: "Lighting", icon: Sparkles, swatch: "#3B82F6", badge: null },
              { id: "extras", label: "Extras", icon: PlusCircle, swatch: null, badge: null },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-3 rounded-none text-sm font-medium transition-colors border",
                    isActive
                      ? "bg-secondary-foreground/15 text-secondary-foreground border-secondary-foreground/20"
                      : "text-secondary-foreground/60 hover:text-secondary-foreground border-transparent hover:bg-secondary-foreground/5"
                  )}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tab.badge && (
                      <span className="text-xs text-secondary-foreground/50 bg-secondary-foreground/10 px-1.5 py-0.5 rounded-none">
                        {tab.badge}
                      </span>
                    )}
                    {tab.swatch && (
                      <span
                        className="h-2.5 w-2.5 rounded-none border border-secondary-foreground/20 block shrink-0"
                        style={{ backgroundColor: tab.swatch }}
                      />
                    )}
                    {!tab.badge && !tab.swatch && tab.id === "extras" && (
                      <PlusCircle className="h-3 w-3 text-secondary-foreground/40" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Left Sidebar Bottom Section (Summary & Actions) */}
        <div className="space-y-4 pt-4 border-t border-secondary-foreground/10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-foreground/50">
              Summary
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-secondary-foreground mt-1">
              {formatINR(totalPrice)}
            </p>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              className="w-full bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 hover:scale-[1.02] active:scale-[0.98] transition-all font-semibold rounded-none py-6 flex items-center justify-center gap-2"
              disabled={!isValid || isMutating}
              onClick={addBuildToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>

            <div className="flex items-center justify-between px-2 pt-2 text-xs text-secondary-foreground/50">
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-secondary-foreground transition-colors"
                onClick={() => saveBuild()}
                disabled={!isValid || isMutating}
              >
                <Save className="h-3.5 w-3.5" />
                Save Build
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-secondary-foreground transition-colors"
                onClick={shareBuild}
                disabled={!isValid || isMutating}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-secondary-foreground transition-colors"
                onClick={() => {
                  reset();
                  navigate("/garage");
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Center View (3D Canvas + View Controls + Featured Slider) */}
      <main className="flex-1 min-w-0 flex flex-col bg-background justify-between relative md:p-6 overflow-hidden">
        {/* Top Control Bar (Pill selector) */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-card border border-border rounded-none p-1 flex gap-1 shadow-sm">
          {[
            { id: "3d", label: "3D" },
            { id: "explode", label: "Explode" },
            { id: "top", label: "Top" },
            { id: "side", label: "Side" },
            { id: "front", label: "Front" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={cn(
                "px-4 py-1.5 rounded-none text-xs font-semibold tracking-wide transition-all uppercase",
                viewMode === mode.id
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode(mode.id as any)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* 3D Model Display */}
        <div className="h-[40vh] md:h-auto md:flex-1 w-full flex items-center justify-center relative min-h-0">
          <GltfKeyboardViewer
            embedded
            garageKeycapTheme={theme}
            isInteractive
            isHeroKeyboardInView={false}
            viewMode={viewMode}
          />

          {/* Bottom-center pill controls (Interactive helpers) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-none p-1.5 flex gap-3 shadow-sm text-muted-foreground">
            <button
              type="button"
              className="p-1 hover:text-foreground transition-colors"
              title="Pan camera"
            >
              <Move className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-1 hover:text-foreground transition-colors"
              onClick={() => setViewMode("3d")}
              title="Rotate model"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-1 hover:text-foreground transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* FEATURED BUILDS Slider (Desktop Only) */}
        <div className="hidden md:block w-full max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Featured Builds
            </h3>
            <div className="flex gap-1.5">
              <button
                type="button"
                className="h-7 w-7 rounded-none border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => scrollCarousel("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="h-7 w-7 rounded-none border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => scrollCarousel("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto scrollbar-none pb-2"
          >
            {FEATURED_BUILDS.map((build) => {
              const isSelected = activeBuildId === build.id;
              return (
                <button
                  key={build.id}
                  type="button"
                  className={cn(
                    "flex-shrink-0 flex items-center gap-3 bg-card border p-3 rounded-none text-left transition-all hover:shadow-sm cursor-pointer",
                    isSelected ? "border-primary ring-1 ring-primary" : "border-border"
                  )}
                  onClick={() => applyFeaturedBuild(build)}
                  style={{ width: "200px" }}
                >
                  <div className="h-12 w-16 bg-muted border border-border rounded-none overflow-hidden flex items-center justify-center">
                    <img
                      src={build.image}
                      alt={build.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{build.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                      {build.layout}% Layout
                    </p>
                  </div>
                  {isSelected && (
                    <span className="h-4 w-4 bg-secondary text-secondary-foreground rounded-none flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Mobile Configuration & Option Areas (Visible below md) */}
        <div className="flex md:hidden flex-col flex-1 min-h-0 bg-background border-t border-border">
          {/* Horizontal Tabs List */}
          <div className="flex gap-2 overflow-x-auto p-3 border-b border-border bg-muted/20 scrollbar-none shrink-0">
            {[
              { id: "layout", label: "Layout" },
              { id: "keycaps", label: "Keycaps" },
              { id: "switches", label: "Switches" },
              { id: "case", label: "Case" },
              { id: "plate", label: "Plate" },
              { id: "lighting", label: "Lighting" },
              { id: "extras", label: "Extras" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={cn(
                    "px-3.5 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-all border",
                    isActive
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "bg-card text-muted-foreground border-border"
                  )}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Scrollable Option Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {renderTabOptions(activeTab)}
          </div>

          {/* Sticky Bottom Actions bar */}
          <div className="p-4 border-t border-border bg-card flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  Total Price
                </p>
                <p className="text-xl font-bold tracking-tight mt-0.5">
                  {formatINR(totalPrice)}
                </p>
              </div>
              <Button
                type="button"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all font-semibold rounded-none px-6 py-4 flex items-center gap-1.5"
                disabled={!isValid || isMutating}
                onClick={addBuildToCart}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add to Cart
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-2 px-1">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-foreground"
                onClick={() => saveBuild()}
                disabled={!isValid || isMutating}
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </button>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-foreground"
                onClick={shareBuild}
                disabled={!isValid || isMutating}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-foreground"
                onClick={() => {
                  reset();
                  navigate("/garage");
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Desktop Right Settings Panel (White, sleek formatting) */}
      <aside className="hidden md:flex w-96 shrink-0 border-l border-border bg-card text-card-foreground flex flex-col">
        {/* Tab-specific options render */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {renderTabOptions(activeTab)}
        </div>

        {/* Right Sidebar Compatibility footer */}
        <div className="p-4 border-t border-border bg-muted/30 space-y-3">
          {compatibilityErrors.length > 0 ? (
            <div className="space-y-1.5 p-2 rounded-none bg-destructive/10 border border-destructive/20 text-xs text-destructive">
              {compatibilityErrors.map((error) => (
                <div key={error} className="flex gap-1.5 items-start">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold px-1">
              <Check className="h-4 w-4 shrink-0" />
              Build is fully compatible
            </div>
          )}

          <div className="flex gap-2 text-[10px] text-muted-foreground leading-relaxed">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              All configurations are validated live for layout footprint compatibility.
            </span>
          </div>
        </div>
      </aside>

      {isLibraryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl bg-white border-2 border-zinc-950 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-zinc-950 flex flex-col max-h-[85vh] overflow-hidden rounded-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <h3 className="text-lg font-bold uppercase tracking-wide">Keycap Library</h3>
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center hover:bg-zinc-100 transition-colors font-bold text-lg"
                onClick={() => setIsLibraryOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Grid */}
            <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 md:grid-cols-3 gap-4 pr-1">
              {[
                { id: "claude", name: "Claude", desc: "Clay · Cream · Espresso · Doubleshot", theme: { base: "#ffffff", modifier: "#7277a9", accent: "#ff79c6", legend: "#050505" } },
                { id: "gemini", name: "Gemini", desc: "Spark · Blue · Indigo · Doubleshot", theme: { base: "#1a1b2e", modifier: "#3d59a1", accent: "#7aa2f7", legend: "#c0cff7" } },
                { id: "sakura", name: "Sakura", desc: "Sakura · Neon · Ink · Doubleshot", theme: { base: "#ffd1dc", modifier: "#d4145a", accent: "#ffffff", legend: "#4a0e30" } },
                { id: "gmk-botanical", name: "GMK Botanical", desc: "Sage · Cream · Charcoal · Doubleshot", theme: { base: "#e2decb", modifier: "#4f5e53", accent: "#a3b19b", legend: "#232f27" } },
                { id: "gmk-deep-sea", name: "GMK Deep Sea", desc: "Navy · Mist · Plum · Doubleshot", theme: { base: "#0f172a", modifier: "#1e293b", accent: "#bd93f9", legend: "#f8f8f2" } },
                { id: "gmk-dune", name: "GMK Dune", desc: "Sand · Tan · Clay · Doubleshot", theme: { base: "#ecd5b3", modifier: "#b88d5e", accent: "#ffffff", legend: "#4e3518" } },
                { id: "gmk-mono", name: "GMK Mono", desc: "White · Black · Doubleshot", theme: { base: "#ffffff", modifier: "#111111", accent: "#111111", legend: "#888888" } },
                { id: "gmk-shadow", name: "GMK Shadow", desc: "Stealth greys · Doubleshot", theme: { base: "#2d2d2d", modifier: "#1a1a1a", accent: "#1a1a1a", legend: "#cccccc" } },
                { id: "gmk-moss", name: "GMK Moss", desc: "Olive · Fern · Bone · Doubleshot", theme: { base: "#fcf8e3", modifier: "#5b6c50", accent: "#7d9c66", legend: "#2d3627" } },
                { id: "gmk-minimal-r", name: "GMK Minimal R", desc: "BoW with red accent · Doubleshot", theme: { base: "#ffffff", modifier: "#ffffff", accent: "#b91c1c", legend: "#000000" } },
                { id: "gmk-rosette", name: "GMK Rosette", desc: "Rose · Ash · Cocoa · Doubleshot", theme: { base: "#f5ebe0", modifier: "#d5bdaf", accent: "#ffffff", legend: "#4f3c30" } },
              ].map((libItem) => {
                const isSelected = activePresetId === libItem.id ||
                  (theme.base === libItem.theme.base &&
                   theme.modifier === libItem.theme.modifier &&
                   theme.accent === libItem.theme.accent &&
                   theme.legend === libItem.theme.legend);

                return (
                  <button
                    key={libItem.id}
                    type="button"
                    className={cn(
                      "flex flex-col text-left p-4 border transition-all hover:shadow-sm cursor-pointer rounded-none bg-white",
                      isSelected
                        ? "border-zinc-950 ring-2 ring-zinc-950"
                        : "border-zinc-200 hover:border-zinc-400"
                    )}
                    onClick={() => {
                      setTheme(cloneGarageTheme(libItem.theme));
                      setIsLibraryOpen(false);
                      toast.success(`Selected keycap set: ${libItem.name}`);
                    }}
                  >
                    {/* Swatches Row */}
                    <div className="flex gap-1.5 mb-3">
                      <span className="h-5 w-5 rounded-none border border-zinc-200" style={{ backgroundColor: libItem.theme.base }} />
                      <span className="h-5 w-5 rounded-none border border-zinc-200" style={{ backgroundColor: libItem.theme.modifier }} />
                      <span className="h-5 w-5 rounded-none border border-zinc-200" style={{ backgroundColor: libItem.theme.accent }} />
                    </div>
                    {/* Title & Desc */}
                    <p className="font-bold text-sm text-zinc-950">{libItem.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wide leading-relaxed">
                      {libItem.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
