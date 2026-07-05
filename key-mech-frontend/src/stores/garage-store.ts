import { create } from "zustand";
import type { GarageBuildResponseDto } from "@/api/generated";
import {
  emptyGarageSelections,
  getGarageSelections,
  getGarageTheme,
  type GarageLayout,
  type GarageSelection,
  type GarageSlot,
} from "@/lib/garage";
import {
  cloneGarageTheme,
  DEFAULT_GARAGE_PRESET,
  type GarageKeycapTheme,
} from "@/lib/garage-theme";

interface GarageState {
  name: string;
  layout: GarageLayout;
  selections: Record<GarageSlot, GarageSelection>;
  theme: GarageKeycapTheme;
  compatibilityErrors: string[];
  totalPrice: number;
  savedBuildId: string | null;
  isPublic: boolean;
  dirty: boolean;
  setName: (name: string) => void;
  setLayout: (layout: GarageLayout) => void;
  setSelection: (slot: GarageSlot, selection: GarageSelection) => void;
  setTheme: (theme: GarageKeycapTheme) => void;
  setCompatibilityErrors: (errors: string[]) => void;
  setTotalPrice: (totalPrice: number) => void;
  loadBuild: (build: GarageBuildResponseDto) => void;
  markSaved: (build: GarageBuildResponseDto) => void;
  reset: () => void;
}

const defaultState = () => ({
  name: "Untitled Garage Build",
  layout: "75" as GarageLayout,
  selections: emptyGarageSelections(),
  theme: cloneGarageTheme(DEFAULT_GARAGE_PRESET.theme),
  compatibilityErrors: [],
  totalPrice: 0,
  savedBuildId: null,
  isPublic: false,
  dirty: false,
});

export const useGarageStore = create<GarageState>()((set) => ({
  ...defaultState(),
  setName: (name) => set({ name, dirty: true }),
  setLayout: (layout) =>
    set((state) => ({
      layout,
      savedBuildId: state.savedBuildId,
      dirty: true,
    })),
  setSelection: (slot, selection) =>
    set((state) => ({
      selections: {
        ...state.selections,
        [slot]: selection,
      },
      dirty: true,
    })),
  setTheme: (theme) => set({ theme: cloneGarageTheme(theme), dirty: true }),
  setCompatibilityErrors: (compatibilityErrors) => set({ compatibilityErrors }),
  setTotalPrice: (totalPrice) => set({ totalPrice }),
  loadBuild: (build) =>
    set({
      name: build.name,
      layout: build.layout as GarageLayout,
      selections: getGarageSelections(build.selections),
      theme: getGarageTheme(build.theme),
      totalPrice: build.totalPrice,
      savedBuildId: build.id,
      isPublic: build.isPublic,
      dirty: false,
    }),
  markSaved: (build) =>
    set({
      name: build.name,
      layout: build.layout as GarageLayout,
      selections: getGarageSelections(build.selections),
      theme: getGarageTheme(build.theme),
      totalPrice: build.totalPrice,
      savedBuildId: build.id,
      isPublic: build.isPublic,
      dirty: false,
    }),
  reset: () => set(defaultState()),
}));
