import * as THREE from "three";
import React, { useRef, forwardRef, useImperativeHandle, useMemo, useEffect } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { COLORWAYS } from "@/lib/constants";
import type { GarageKeycapTheme } from "@/lib/garage-theme";

/**
 * Keycap lettering: shared PNG atlases are authored for glTF TEXCOORD_1 (`uv2`). `MeshStandardMaterial.map`
 * samples TEXCOORD_0 (`uv`), so we clone geometry and copy `uv2` → `uv` when applying a textured keycap
 * material (see `keycapGeometryForTexturedAtlas`). Per-texture override: `KEYCAP_TEXTURES[].atlasUsesUv2`.
 */

type Colorway = (typeof COLORWAYS)[number];

const GARAGE_KEYCAP_ACCENT_IDS = new Set([
  "enter",
  "space",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
]);

const GARAGE_KEYCAP_MODIFIER_IDS = new Set([
  "esc",
  "f1",
  "f2",
  "f3",
  "f4",
  "f5",
  "f6",
  "f7",
  "f8",
  "f9",
  "f10",
  "f11",
  "f12",
  "del",
  "backspace",
  "tab",
  "pageup",
  "caps",
  "pagedown",
  "lshift",
  "rshift",
  "end",
  "lcontrol",
  "lwin",
  "lalt",
  "ralt",
  "fn",
]);

function garageKeycapRole(keyId: string): "base" | "modifier" | "accent" {
  if (GARAGE_KEYCAP_ACCENT_IDS.has(keyId)) return "accent";
  if (GARAGE_KEYCAP_MODIFIER_IDS.has(keyId)) return "modifier";
  return "base";
}

interface KeyboardLabelOverlayProps {
  nodes: GLTFResult["nodes"];
  legendColor: string;
}

function KeyboardLabelOverlay({ nodes, legendColor }: KeyboardLabelOverlayProps) {
  type KeyEntry = {
    geo: THREE.BufferGeometry;
    mp: [number, number, number];
    label: string;
    fs: number;
  };

  const overlay = useMemo(() => {
    const keys: KeyEntry[] = [
      // Function row
      { geo: nodes.K_ESC.geometry, mp: [-0.051, 0.01, -0.106], label: "Esc", fs: 11 },
      { geo: nodes.K_F1.geometry, mp: [-0.051, 0.01, -0.106], label: "F1", fs: 11 },
      { geo: nodes.K_F2.geometry, mp: [-0.051, 0.01, -0.106], label: "F2", fs: 11 },
      { geo: nodes.K_F3.geometry, mp: [-0.051, 0.01, -0.106], label: "F3", fs: 11 },
      { geo: nodes.K_F4.geometry, mp: [-0.051, 0.01, -0.106], label: "F4", fs: 11 },
      { geo: nodes.K_F5.geometry, mp: [-0.051, 0.01, -0.106], label: "F5", fs: 11 },
      { geo: nodes.K_F6.geometry, mp: [-0.051, 0.01, -0.106], label: "F6", fs: 11 },
      { geo: nodes.K_F7.geometry, mp: [-0.051, 0.01, -0.106], label: "F7", fs: 11 },
      { geo: nodes.K_F8.geometry, mp: [-0.051, 0.01, -0.106], label: "F8", fs: 11 },
      { geo: nodes.K_F9.geometry, mp: [-0.051, 0.01, -0.106], label: "F9", fs: 11 },
      { geo: nodes.K_F10.geometry, mp: [-0.051, 0.01, -0.106], label: "F10", fs: 10 },
      { geo: nodes.K_F11.geometry, mp: [-0.051, 0.01, -0.106], label: "F11", fs: 10 },
      { geo: nodes.K_F12.geometry, mp: [-0.051, 0.01, -0.106], label: "F12", fs: 10 },
      { geo: nodes.K_DEL.geometry, mp: [-0.165, 0.01, -0.087], label: "Del", fs: 11 },
      // Number row
      { geo: nodes.K_GRAVE.geometry, mp: [-0.165, 0.01, -0.087], label: "`", fs: 13 },
      { geo: nodes.K_1.geometry, mp: [-0.165, 0.01, -0.087], label: "1", fs: 14 },
      { geo: nodes.K_2.geometry, mp: [-0.165, 0.01, -0.087], label: "2", fs: 14 },
      { geo: nodes.K_3.geometry, mp: [-0.165, 0.01, -0.087], label: "3", fs: 14 },
      { geo: nodes.K_4.geometry, mp: [-0.165, 0.01, -0.087], label: "4", fs: 14 },
      { geo: nodes.K_5.geometry, mp: [-0.165, 0.01, -0.087], label: "5", fs: 14 },
      { geo: nodes.K_6.geometry, mp: [-0.165, 0.01, -0.087], label: "6", fs: 14 },
      { geo: nodes.K_7.geometry, mp: [-0.165, 0.01, -0.087], label: "7", fs: 14 },
      { geo: nodes.K_8.geometry, mp: [-0.165, 0.01, -0.087], label: "8", fs: 14 },
      { geo: nodes.K_9.geometry, mp: [-0.165, 0.01, -0.087], label: "9", fs: 14 },
      { geo: nodes.K_0.geometry, mp: [-0.165, 0.01, -0.087], label: "0", fs: 14 },
      { geo: nodes.K_DASH.geometry, mp: [-0.165, 0.01, -0.087], label: "-", fs: 14 },
      { geo: nodes.K_EQUAL.geometry, mp: [-0.165, 0.01, -0.087], label: "=", fs: 14 },
      { geo: nodes.K_BACKSPACE.geometry, mp: [0.092, 0, -0.087], label: "Bksp", fs: 10 },
      // Top row
      { geo: nodes.K_TAB.geometry, mp: [-0.16, 0.008, -0.068], label: "Tab", fs: 12 },
      { geo: nodes.K_Q.geometry, mp: [-0.136, 0.008, -0.068], label: "Q", fs: 14 },
      { geo: nodes.K_W.geometry, mp: [-0.136, 0.008, -0.068], label: "W", fs: 14 },
      { geo: nodes.K_E.geometry, mp: [-0.136, 0.008, -0.068], label: "E", fs: 14 },
      { geo: nodes.K_R.geometry, mp: [-0.136, 0.008, -0.068], label: "R", fs: 14 },
      { geo: nodes.K_T.geometry, mp: [-0.136, 0.008, -0.068], label: "T", fs: 14 },
      { geo: nodes.K_Y.geometry, mp: [-0.136, 0.008, -0.068], label: "Y", fs: 14 },
      { geo: nodes.K_U.geometry, mp: [-0.136, 0.008, -0.068], label: "U", fs: 14 },
      { geo: nodes.K_I.geometry, mp: [-0.136, 0.008, -0.068], label: "I", fs: 14 },
      { geo: nodes.K_O.geometry, mp: [-0.136, 0.008, -0.068], label: "O", fs: 14 },
      { geo: nodes.K_P.geometry, mp: [-0.136, 0.008, -0.068], label: "P", fs: 14 },
      { geo: nodes.K_LSQUAREBRACKET.geometry, mp: [-0.136, 0.008, -0.068], label: "[", fs: 14 },
      { geo: nodes.K_RSQUAREBRACKET.geometry, mp: [-0.136, 0.008, -0.068], label: "]", fs: 14 },
      { geo: nodes.K_BACKSLASH.geometry, mp: [-0.16, 0.008, -0.068], label: "\\", fs: 14 },
      { geo: nodes.K_PAGEUP.geometry, mp: [-0.136, 0.008, -0.068], label: "PgUp", fs: 10 },
      // Home row
      { geo: nodes.K_CAPS.geometry, mp: [-0.158, 0, -0.049], label: "Caps", fs: 11 },
      { geo: nodes.K_A.geometry, mp: [-0.132, 0.007, -0.049], label: "A", fs: 14 },
      { geo: nodes.K_S.geometry, mp: [-0.132, 0.007, -0.049], label: "S", fs: 14 },
      { geo: nodes.K_D.geometry, mp: [-0.132, 0.007, -0.049], label: "D", fs: 14 },
      { geo: nodes.K_F.geometry, mp: [-0.132, 0.007, -0.049], label: "F", fs: 14 },
      { geo: nodes.K_G.geometry, mp: [-0.132, 0.007, -0.049], label: "G", fs: 14 },
      { geo: nodes.K_H.geometry, mp: [-0.132, 0.007, -0.049], label: "H", fs: 14 },
      { geo: nodes.K_J.geometry, mp: [-0.132, 0.007, -0.049], label: "J", fs: 14 },
      { geo: nodes.K_K.geometry, mp: [-0.132, 0.007, -0.049], label: "K", fs: 14 },
      { geo: nodes.K_L.geometry, mp: [-0.132, 0.007, -0.049], label: "L", fs: 14 },
      { geo: nodes.K_SEMICOLON.geometry, mp: [-0.132, 0.007, -0.049], label: ";", fs: 14 },
      { geo: nodes.K_QUOTE.geometry, mp: [-0.132, 0.007, -0.049], label: "'", fs: 14 },
      { geo: nodes.K_ENTER.geometry, mp: [0.09, 0, -0.049], label: "Enter", fs: 11 },
      { geo: nodes.K_PAGEDOWN.geometry, mp: [-0.132, 0.007, -0.049], label: "PgDn", fs: 10 },
      // Bottom row
      { geo: nodes.K_LSHIFT.geometry, mp: [-0.153, 0, -0.03], label: "Shift", fs: 11 },
      { geo: nodes.K_Z.geometry, mp: [-0.122, 0.008, -0.03], label: "Z", fs: 14 },
      { geo: nodes.K_X.geometry, mp: [-0.122, 0.008, -0.03], label: "X", fs: 14 },
      { geo: nodes.K_C.geometry, mp: [-0.122, 0.008, -0.03], label: "C", fs: 14 },
      { geo: nodes.K_V.geometry, mp: [-0.122, 0.008, -0.03], label: "V", fs: 14 },
      { geo: nodes.K_B.geometry, mp: [-0.122, 0.008, -0.03], label: "B", fs: 14 },
      { geo: nodes.K_N.geometry, mp: [-0.122, 0.008, -0.03], label: "N", fs: 14 },
      { geo: nodes.K_M.geometry, mp: [-0.122, 0.008, -0.03], label: "M", fs: 14 },
      { geo: nodes.K_COMMA.geometry, mp: [-0.122, 0.008, -0.03], label: ",", fs: 14 },
      { geo: nodes.K_PERIOD.geometry, mp: [-0.122, 0.008, -0.03], label: ".", fs: 14 },
      { geo: nodes.K_SLASH.geometry, mp: [-0.122, 0.008, -0.03], label: "/", fs: 14 },
      { geo: nodes.K_RSHIFT.geometry, mp: [0.076, 0, -0.03], label: "Shift", fs: 11 },
      { geo: nodes.K_ARROWUP.geometry, mp: [-0.122, 0.008, -0.03], label: "↑", fs: 14 },
      { geo: nodes.K_END.geometry, mp: [-0.122, 0.008, -0.03], label: "End", fs: 11 },
      // Modifier row
      { geo: nodes.K_LCONTROL.geometry, mp: [-0.162, 0.008, -0.011], label: "Ctrl", fs: 11 },
      { geo: nodes.K_LWIN.geometry, mp: [-0.162, 0.008, -0.011], label: "Win", fs: 11 },
      { geo: nodes.K_LALT.geometry, mp: [-0.162, 0.008, -0.011], label: "Alt", fs: 11 },
      { geo: nodes.K_RALT.geometry, mp: [-0.162, 0.008, -0.011], label: "Alt", fs: 11 },
      { geo: nodes.K_FN.geometry, mp: [-0.162, 0.008, -0.011], label: "Fn", fs: 11 },
      // Arrow keys
      { geo: nodes.K_ARROWLEFT.geometry, mp: [0.083, 0.008, -0.011], label: "←", fs: 14 },
      { geo: nodes.K_ARROWDOWN.geometry, mp: [0.083, 0.008, -0.011], label: "↓", fs: 14 },
      { geo: nodes.K_ARROWRIGHT.geometry, mp: [0.083, 0.008, -0.011], label: "→", fs: 14 },
    ];

    // Compute world-space center of each key's top face
    const centers = keys.map(({ geo, mp, label, fs }) => {
      geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      return {
        x: (bb.min.x + bb.max.x) / 2 + mp[0],
        y: bb.max.y + mp[1],
        z: (bb.min.z + bb.max.z) / 2 + mp[2],
        label,
        fs,
      };
    });

    const pad = 0.01;
    const minX = Math.min(...centers.map((c) => c.x)) - pad;
    const maxX = Math.max(...centers.map((c) => c.x)) + pad;
    const minZ = Math.min(...centers.map((c) => c.z)) - pad;
    const maxZ = Math.max(...centers.map((c) => c.z)) + pad;

    // Flat plane just above the highest keycap top surface.
    // A tilt was attempted but Caps/Shift/Enter/Space have mp[1]=0 while neighbouring alphas
    // have mp[1]=0.007-0.008, making any linear slope calculation unreliable. Flat at maxY is safest.
    const planeZSpan = maxZ - minZ;
    const planeY = Math.max(...centers.map((c) => c.y)) + 0.0002;

    const W = 1024;
    const H = Math.max(64, Math.round(W * (maxZ - minZ) / (maxX - minX)));
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = legendColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    centers.forEach((c) => {
      const cx = ((c.x - minX) / (maxX - minX)) * W;
      // With CanvasTexture flipY=true (default):
      // canvas y=0 (top) → UV v=1 → plane local y=+H/2 → world z=minZ (function row)
      // canvas y=H (bottom) → UV v=0 → plane local y=-H/2 → world z=maxZ (modifier row)
      // So: canvas_y = (worldZ - minZ) / (maxZ - minZ) * H
      const cy = ((c.z - minZ) / (maxZ - minZ)) * H;
      ctx.font = `bold ${c.fs}px system-ui, sans-serif`;
      ctx.fillText(c.label, cx, cy);
    });

    const texture = new THREE.CanvasTexture(canvas);

    return {
      texture,
      planeW: maxX - minX,
      planeH: planeZSpan,
      planeCX: (minX + maxX) / 2,
      planeCZ: (minZ + maxZ) / 2,
      planeY,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, legendColor]);

  useEffect(() => {
    return () => overlay.texture.dispose();
  }, [overlay.texture]);

  return (
    <mesh
      position={[overlay.planeCX, overlay.planeY, overlay.planeCZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={2}
    >
      <planeGeometry args={[overlay.planeW, overlay.planeH]} />
      <meshBasicMaterial
        map={overlay.texture}
        transparent
        alphaTest={0.05}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Keycap glTF primitives ship TEXCOORD_0 + TEXCOORD_1. Our shared atlas (e.g. t1.png) lines up
 * with the second set, but MeshStandardMaterial.map always samples `uv`. Without swapping, legends
 * project onto sides / plate. Cache clones per source BufferGeometry (shared across key rows).
 */
const keycapAtlasGeometryCache = new WeakMap<
  THREE.BufferGeometry,
  THREE.BufferGeometry
>();

function keycapGeometryForTexturedAtlas(
  source: THREE.BufferGeometry,
  useSecondUvChannel: boolean,
): THREE.BufferGeometry {
  if (!useSecondUvChannel) return source;
  const uv2 = source.getAttribute("uv2");
  if (!uv2) return source;
  let cached = keycapAtlasGeometryCache.get(source);
  if (!cached) {
    cached = source.clone();
    cached.setAttribute("uv", uv2.clone());
    keycapAtlasGeometryCache.set(source, cached);
  }
  return cached;
}

type GLTFResult = {
  nodes: {
    Plate: THREE.Mesh;
    Knob: THREE.Mesh;
    PCB: THREE.Mesh;
    ["625u_Wire001"]: THREE.Mesh;
    Cube005: THREE.Mesh;
    Cube005_1: THREE.Mesh;
    Top_Case: THREE.Mesh;
    Weight: THREE.Mesh;
    Screen: THREE.Mesh;
    K_LCONTROL: THREE.Mesh;
    K_GRAVE: THREE.Mesh;
    K_A: THREE.Mesh;
    K_Q: THREE.Mesh;
    K_ESC: THREE.Mesh;
    K_SPACE: THREE.Mesh;
    K_Z: THREE.Mesh;
    K_ARROWLEFT: THREE.Mesh;
    K_TAB: THREE.Mesh;
    K_ENTER: THREE.Mesh;
    K_BACKSPACE: THREE.Mesh;
    K_CAPS: THREE.Mesh;
    K_LSHIFT: THREE.Mesh;
    K_RSHIFT: THREE.Mesh;
    K_ARROWDOWN: THREE.Mesh;
    K_ARROWRIGHT: THREE.Mesh;
    K_LALT: THREE.Mesh;
    K_LWIN: THREE.Mesh;
    K_RALT: THREE.Mesh;
    K_FN: THREE.Mesh;
    K_1: THREE.Mesh;
    K_2: THREE.Mesh;
    K_3: THREE.Mesh;
    K_4: THREE.Mesh;
    K_5: THREE.Mesh;
    K_6: THREE.Mesh;
    K_7: THREE.Mesh;
    K_8: THREE.Mesh;
    K_9: THREE.Mesh;
    K_0: THREE.Mesh;
    K_DASH: THREE.Mesh;
    K_EQUAL: THREE.Mesh;
    K_DEL: THREE.Mesh;
    K_S: THREE.Mesh;
    K_D: THREE.Mesh;
    K_F: THREE.Mesh;
    K_G: THREE.Mesh;
    K_H: THREE.Mesh;
    K_J: THREE.Mesh;
    K_K: THREE.Mesh;
    K_L: THREE.Mesh;
    K_SEMICOLON: THREE.Mesh;
    K_QUOTE: THREE.Mesh;
    K_PAGEDOWN: THREE.Mesh;
    K_W: THREE.Mesh;
    K_E: THREE.Mesh;
    K_R: THREE.Mesh;
    K_T: THREE.Mesh;
    K_Y: THREE.Mesh;
    K_U: THREE.Mesh;
    K_I: THREE.Mesh;
    K_O: THREE.Mesh;
    K_P: THREE.Mesh;
    K_LSQUAREBRACKET: THREE.Mesh;
    K_RSQUAREBRACKET: THREE.Mesh;
    K_PAGEUP: THREE.Mesh;
    K_F1: THREE.Mesh;
    K_F2: THREE.Mesh;
    K_F3: THREE.Mesh;
    K_F4: THREE.Mesh;
    K_F5: THREE.Mesh;
    K_F6: THREE.Mesh;
    K_F7: THREE.Mesh;
    K_F8: THREE.Mesh;
    K_F9: THREE.Mesh;
    K_F10: THREE.Mesh;
    K_F11: THREE.Mesh;
    K_F12: THREE.Mesh;
    K_X: THREE.Mesh;
    K_C: THREE.Mesh;
    K_V: THREE.Mesh;
    K_B: THREE.Mesh;
    K_N: THREE.Mesh;
    K_M: THREE.Mesh;
    K_COMMA: THREE.Mesh;
    K_PERIOD: THREE.Mesh;
    K_SLASH: THREE.Mesh;
    K_ARROWUP: THREE.Mesh;
    K_END: THREE.Mesh;
    K_BACKSLASH: THREE.Mesh;
    Switch_Heavy002: THREE.InstancedMesh;
    Switch_Heavy002_1: THREE.InstancedMesh;
    Switch_Heavy002_2: THREE.InstancedMesh;
    Switch_Heavy002_3: THREE.InstancedMesh;
    ["2U_Wires"]: THREE.InstancedMesh;
    Stab_Housing_Instances: THREE.InstancedMesh;
  };
  materials: {
    PC: THREE.MeshStandardMaterial;
    Knob: THREE.MeshStandardMaterial;
    PCB_Black: THREE.MeshStandardMaterial;
    Gold: THREE.MeshStandardMaterial;
    Bottom_Case: THREE.MeshStandardMaterial;
    Feet: THREE.MeshStandardMaterial;
    Top_Case: THREE.MeshStandardMaterial;
    Weight: THREE.MeshStandardMaterial;
    Screen: THREE.MeshPhysicalMaterial;
    Keycaps: THREE.MeshPhysicalMaterial;
    Switch_Bottom_Housing: THREE.MeshStandardMaterial;
    Stem: THREE.MeshStandardMaterial;
    Switch_Top_Housing: THREE.MeshStandardMaterial;
  };
  animations: THREE.AnimationClip[];
};

export interface KeyboardRefs {
  // Main keyboard structure
  plate: React.RefObject<THREE.Mesh | null>;
  topCase: React.RefObject<THREE.Mesh | null>;
  weight: React.RefObject<THREE.Mesh | null>;
  screen: React.RefObject<THREE.Mesh | null>;
  knob: React.RefObject<THREE.Mesh | null>;

  /** All keycap row groups — use for whole-keyboard keycap transforms (e.g. hero zoom). */
  keycapsRoot: React.RefObject<THREE.Group | null>;

  // Switch groups for wave animation
  switches: {
    functionRow: React.RefObject<THREE.Group | null>;
    numberRow: React.RefObject<THREE.Group | null>;
    topRow: React.RefObject<THREE.Group | null>;
    homeRow: React.RefObject<THREE.Group | null>;
    bottomRow: React.RefObject<THREE.Group | null>;
    modifiers: React.RefObject<THREE.Group | null>;
    arrows: React.RefObject<THREE.Group | null>;
  };

  // Keycap groups for easy animation targeting
  keycaps: {
    functionRow: React.RefObject<THREE.Group | null>;
    numberRow: React.RefObject<THREE.Group | null>;
    topRow: React.RefObject<THREE.Group | null>;
    homeRow: React.RefObject<THREE.Group | null>;
    bottomRow: React.RefObject<THREE.Group | null>;
    modifiers: React.RefObject<THREE.Group | null>;
    arrows: React.RefObject<THREE.Group | null>;
  };

  // Individual keycaps for detailed animations
  keys: {
    [key: string]: React.RefObject<THREE.Mesh | null>;
  };

  // Main container
  container: React.RefObject<THREE.Group | null>;
}

interface KeyboardProps extends React.ComponentProps<"group"> {
  keycapMaterial?: THREE.Material;
  /** When the active keycap texture maps legends to `uv2` instead of `uv`; defaults from material. */
  keycapAtlasUsesUv2?: boolean;
  knobColor?: string;
  caseColor?: string;
  /** When set, top/bottom case materials follow the landing-page colorway. */
  activeColorway?: Colorway;
  /** Grouped keycap colors; reuses hero keycap texture map when keycapMaterial provides it. */
  garageKeycapTheme?: GarageKeycapTheme;
}

function materialUsesKeycapTextureMap(
  material: THREE.Material,
): material is THREE.MeshStandardMaterial {
  return material instanceof THREE.MeshStandardMaterial && material.map != null;
}

export const Keyboard = forwardRef<KeyboardRefs, KeyboardProps>(
  (
    {
      keycapMaterial,
      keycapAtlasUsesUv2,
      knobColor,
      caseColor,
      activeColorway,
      garageKeycapTheme,
      ...props
    },
    ref,
  ) => {
    const { nodes, materials } = useGLTF(
      "/keyboard.gltf",
    ) as unknown as GLTFResult;

    // Main structure refs
    const containerRef = useRef<THREE.Group>(null);
    const plateRef = useRef<THREE.Mesh>(null);
    const topCaseRef = useRef<THREE.Mesh>(null);
    const weightRef = useRef<THREE.Mesh>(null);
    const screenRef = useRef<THREE.Mesh>(null);
    const knobRef = useRef<THREE.Mesh>(null);
    const keycapsRootRef = useRef<THREE.Group>(null);

    // Switch group refs
    const switchFunctionRowRef = useRef<THREE.Group>(null);
    const switchNumberRowRef = useRef<THREE.Group>(null);
    const switchTopRowRef = useRef<THREE.Group>(null);
    const switchHomeRowRef = useRef<THREE.Group>(null);
    const switchBottomRowRef = useRef<THREE.Group>(null);
    const switchModifiersRef = useRef<THREE.Group>(null);
    const switchArrowsRef = useRef<THREE.Group>(null);

    // Keycap group refs
    const functionRowRef = useRef<THREE.Group>(null);
    const numberRowRef = useRef<THREE.Group>(null);
    const topRowRef = useRef<THREE.Group>(null);
    const homeRowRef = useRef<THREE.Group>(null);
    const bottomRowRef = useRef<THREE.Group>(null);
    const modifiersRef = useRef<THREE.Group>(null);
    const arrowsRef = useRef<THREE.Group>(null);

    // Individual key refs
    const keyRefs = {
      esc: useRef<THREE.Mesh>(null),
      f1: useRef<THREE.Mesh>(null),
      f2: useRef<THREE.Mesh>(null),
      f3: useRef<THREE.Mesh>(null),
      f4: useRef<THREE.Mesh>(null),
      f5: useRef<THREE.Mesh>(null),
      f6: useRef<THREE.Mesh>(null),
      f7: useRef<THREE.Mesh>(null),
      f8: useRef<THREE.Mesh>(null),
      f9: useRef<THREE.Mesh>(null),
      f10: useRef<THREE.Mesh>(null),
      f11: useRef<THREE.Mesh>(null),
      f12: useRef<THREE.Mesh>(null),
      del: useRef<THREE.Mesh>(null),
      grave: useRef<THREE.Mesh>(null),
      one: useRef<THREE.Mesh>(null),
      two: useRef<THREE.Mesh>(null),
      three: useRef<THREE.Mesh>(null),
      four: useRef<THREE.Mesh>(null),
      five: useRef<THREE.Mesh>(null),
      six: useRef<THREE.Mesh>(null),
      seven: useRef<THREE.Mesh>(null),
      eight: useRef<THREE.Mesh>(null),
      nine: useRef<THREE.Mesh>(null),
      zero: useRef<THREE.Mesh>(null),
      dash: useRef<THREE.Mesh>(null),
      equal: useRef<THREE.Mesh>(null),
      backspace: useRef<THREE.Mesh>(null),
      tab: useRef<THREE.Mesh>(null),
      q: useRef<THREE.Mesh>(null),
      w: useRef<THREE.Mesh>(null),
      e: useRef<THREE.Mesh>(null),
      r: useRef<THREE.Mesh>(null),
      t: useRef<THREE.Mesh>(null),
      y: useRef<THREE.Mesh>(null),
      u: useRef<THREE.Mesh>(null),
      i: useRef<THREE.Mesh>(null),
      o: useRef<THREE.Mesh>(null),
      p: useRef<THREE.Mesh>(null),
      lsquarebracket: useRef<THREE.Mesh>(null),
      rsquarebracket: useRef<THREE.Mesh>(null),
      backslash: useRef<THREE.Mesh>(null),
      pageup: useRef<THREE.Mesh>(null),
      caps: useRef<THREE.Mesh>(null),
      a: useRef<THREE.Mesh>(null),
      s: useRef<THREE.Mesh>(null),
      d: useRef<THREE.Mesh>(null),
      f: useRef<THREE.Mesh>(null),
      g: useRef<THREE.Mesh>(null),
      h: useRef<THREE.Mesh>(null),
      j: useRef<THREE.Mesh>(null),
      k: useRef<THREE.Mesh>(null),
      l: useRef<THREE.Mesh>(null),
      semicolon: useRef<THREE.Mesh>(null),
      quote: useRef<THREE.Mesh>(null),
      enter: useRef<THREE.Mesh>(null),
      pagedown: useRef<THREE.Mesh>(null),
      lshift: useRef<THREE.Mesh>(null),
      z: useRef<THREE.Mesh>(null),
      x: useRef<THREE.Mesh>(null),
      c: useRef<THREE.Mesh>(null),
      v: useRef<THREE.Mesh>(null),
      b: useRef<THREE.Mesh>(null),
      n: useRef<THREE.Mesh>(null),
      m: useRef<THREE.Mesh>(null),
      comma: useRef<THREE.Mesh>(null),
      period: useRef<THREE.Mesh>(null),
      slash: useRef<THREE.Mesh>(null),
      rshift: useRef<THREE.Mesh>(null),
      arrowup: useRef<THREE.Mesh>(null),
      end: useRef<THREE.Mesh>(null),
      lcontrol: useRef<THREE.Mesh>(null),
      lwin: useRef<THREE.Mesh>(null),
      lalt: useRef<THREE.Mesh>(null),
      space: useRef<THREE.Mesh>(null),
      ralt: useRef<THREE.Mesh>(null),
      fn: useRef<THREE.Mesh>(null),
      arrowleft: useRef<THREE.Mesh>(null),
      arrowdown: useRef<THREE.Mesh>(null),
      arrowright: useRef<THREE.Mesh>(null),
    };

    // Expose refs through imperative handle
    useImperativeHandle(ref, () => ({
      plate: plateRef,
      topCase: topCaseRef,
      weight: weightRef,
      screen: screenRef,
      knob: knobRef,
      keycapsRoot: keycapsRootRef,
      switches: {
        functionRow: switchFunctionRowRef,
        numberRow: switchNumberRowRef,
        topRow: switchTopRowRef,
        homeRow: switchHomeRowRef,
        bottomRow: switchBottomRowRef,
        modifiers: switchModifiersRef,
        arrows: switchArrowsRef,
      },
      keycaps: {
        functionRow: functionRowRef,
        numberRow: numberRowRef,
        topRow: topRowRef,
        homeRow: homeRowRef,
        bottomRow: bottomRowRef,
        modifiers: modifiersRef,
        arrows: arrowsRef,
      },
      keys: keyRefs,
      container: containerRef,
    }));

    const keycapTexture = useTexture("/t1.png");
    keycapTexture.flipY = false;
    keycapTexture.colorSpace = THREE.SRGBColorSpace;

    const knurlTexture = useTexture("/Knurl.jpg");
    knurlTexture.flipY = false;

    knurlTexture.repeat.set(6, 6);
    knurlTexture.wrapS = THREE.RepeatWrapping;
    knurlTexture.wrapT = THREE.RepeatWrapping;

    const screenTexture = useTexture("/screen_uv.png");
    screenTexture.flipY = false;

    screenTexture.repeat.set(-1, -1);
    screenTexture.offset.set(1, 1);

    const defaultKeycapMat = new THREE.MeshStandardMaterial({
      roughness: 0.6,
      map: keycapTexture,
    });

    const keycapMat = keycapMaterial || defaultKeycapMat;

    const garageGroupMaterials = useMemo(() => {
      if (!garageKeycapTheme) return null;

      const baseMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(garageKeycapTheme.base),
        roughness: 0.6,
        metalness: 0,
      });
      const modifierMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(garageKeycapTheme.modifier),
        roughness: 0.6,
        metalness: 0,
      });
      const accentMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(garageKeycapTheme.accent),
        roughness: 0.6,
        metalness: 0,
      });
      return { base: baseMat, modifier: modifierMat, accent: accentMat };
    }, [garageKeycapTheme]);

    useEffect(() => {
      if (!garageGroupMaterials) return;
      const g = garageGroupMaterials;
      return () => {
        g.base.dispose();
        g.modifier.dispose();
        g.accent.dispose();
      };
    }, [garageGroupMaterials]);

    const capMat = (keyId: string): THREE.Material => {
      if (!garageGroupMaterials) return keycapMat;
      const role = garageKeycapRole(keyId);
      if (role === "accent") return garageGroupMaterials.accent;
      if (role === "modifier") return garageGroupMaterials.modifier;
      return garageGroupMaterials.base;
    };

    const useSecondUvForAtlas =
      keycapAtlasUsesUv2 !== undefined
        ? keycapAtlasUsesUv2 && materialUsesKeycapTextureMap(keycapMat)
        : materialUsesKeycapTextureMap(keycapMat);
    const keycapGeo = (geometry: THREE.BufferGeometry) =>
      keycapGeometryForTexturedAtlas(geometry, useSecondUvForAtlas);

    const knobMat = new THREE.MeshStandardMaterial({
      color: knobColor || "#D4145A",   // brighter orange pops on dark bg
      roughness: 0.4,
      metalness: 1,
      bumpMap: knurlTexture,
      bumpScale: 0.8,
    });
    const plateMat = new THREE.MeshStandardMaterial({
      color: "#2A2A2A",                // dark charcoal plate
      roughness: 0.5,
    });
    const bottomCaseColor =
      caseColor ?? activeColorway?.vars["--case-dark"] ?? "#0A1628";
    const topCaseColor =
      caseColor ?? activeColorway?.vars["--case-color"] ?? "#1A1A2E";
    const bottomCaseMat = new THREE.MeshStandardMaterial({
      color: bottomCaseColor,
      roughness: 0.5,
    });
    const topCaseMat = new THREE.MeshStandardMaterial({
      color: topCaseColor,
      roughness: 0.8,
    });
    const feetMat = new THREE.MeshStandardMaterial({
      color: "#111111",                // near-black rubber feet
      roughness: 0.9,
    });
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      roughness: 0.2,                  // slightly more reflective for dark OLED look
    });
    const switchMat = new THREE.MeshStandardMaterial({
      color: "#7d7d7d",                // dark grey switch housing
      roughness: 0.1,
    });
    const switchStemMat = new THREE.MeshStandardMaterial({
      color: "#16dbc8",                // keep red stem, slightly deeper
      roughness: 0.4,
    });
    const switchContactsMat = new THREE.MeshStandardMaterial({
      color: "#D4A017",                // deeper gold, less washed out on dark
      roughness: 0.1,
      metalness: 1,
    });
    return (
      <group {...props} dispose={null} ref={containerRef}>
        <group position={[0.02, 0, 0]}>
          <mesh
            ref={plateRef}
            castShadow
            receiveShadow
            geometry={nodes.Plate.geometry}
            material={plateMat}
            position={[-0.022, -0.006, -0.057]}
          />
          <mesh
            ref={knobRef}
            castShadow
            receiveShadow
            geometry={nodes.Knob.geometry}
            material={knobMat}
            position={[0.121, 0.004, -0.106]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.PCB.geometry}
            material={plateMat}
            position={[-0.022, -0.009, -0.057]}
          />

          {/* Switches - organized by rows with individual meshes for animation */}
          {/* Function Row Switches */}
          <group ref={switchFunctionRowRef}>
            {[
              -0.165, -0.145, -0.126, -0.107, -0.088, -0.069, -0.05, -0.031,
              -0.012, 0.007, 0.026, 0.045, 0.064,
            ].map((x, i) => (
              <group key={`switch-f-${i}`} position={[x, -0.002, -0.106]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Number Row Switches */}
          <group ref={switchNumberRowRef}>
            {[
              -0.165, -0.146, -0.127, -0.108, -0.089, -0.07, -0.051, -0.032,
              -0.013, 0.006, 0.025, 0.044, 0.063, 0.092, 0.121,
            ].map((x, i) => (
              <group key={`switch-n-${i}`} position={[x, -0.002, -0.087]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Top Row Switches */}
          <group ref={switchTopRowRef}>
            {[
              -0.16, -0.136, -0.117, -0.098, -0.079, -0.06, -0.041, -0.022,
              -0.003, 0.016, 0.035, 0.054, 0.073, 0.097, 0.121,
            ].map((x, i) => (
              <group key={`switch-t-${i}`} position={[x, -0.002, -0.068]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Home Row Switches */}
          <group ref={switchHomeRowRef}>
            {[
              -0.158, -0.132, -0.113, -0.094, -0.075, -0.056, -0.037, -0.018,
              0.001, 0.02, 0.039, 0.058, 0.09, 0.121,
            ].map((x, i) => (
              <group key={`switch-h-${i}`} position={[x, -0.002, -0.049]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Bottom Row Switches */}
          <group ref={switchBottomRowRef}>
            {[
              -0.153, -0.122, -0.103, -0.084, -0.065, -0.046, -0.027, -0.008,
              0.011, 0.03, 0.049, 0.076, 0.121,
            ].map((x, i) => (
              <group key={`switch-b-${i}`} position={[x, 0.0, -0.03]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Modifier Switches */}
          <group ref={switchModifiersRef}>
            {[
              [-0.162, -0.011],
              [-0.139, -0.011],
              [-0.115, -0.011],
              [-0.043, -0.01], // Space key
              [0.028, -0.011],
              [0.052, -0.011],
            ].map(([x, z], i) => (
              <group key={`switch-m-${i}`} position={[x, -0.002, z]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          {/* Arrow Switches */}
          <group ref={switchArrowsRef}>
            {[
              [0.102, -0.03],
              [0.083, -0.011],
              [0.102, -0.011],
              [0.121, -0.011],
            ].map(([x, z], i) => (
              <group key={`switch-a-${i}`} position={[x, -0.002, z]}>
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002.geometry}
                  material={switchMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_1.geometry}
                  material={switchContactsMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_2.geometry}
                  material={switchStemMat}
                />
                <mesh
                  castShadow
                  receiveShadow
                  geometry={nodes.Switch_Heavy002_3.geometry}
                  material={switchMat}
                />
              </group>
            ))}
          </group>

          <mesh
            castShadow
            receiveShadow
            geometry={nodes["625u_Wire001"].geometry}
            material={materials.Gold}
            position={[-0.043, -0.001, -0.014]}
            rotation={[Math.PI, 0, Math.PI]}
          />
          <group position={[-0.022, -0.014, -0.057]}>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Cube005.geometry}
              material={bottomCaseMat}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Cube005_1.geometry}
              material={feetMat}
            />
          </group>
          <mesh
            ref={topCaseRef}
            castShadow
            receiveShadow
            geometry={nodes.Top_Case.geometry}
            material={topCaseMat}
            position={[-0.022, -0.014, -0.057]}
          />
          <mesh
            ref={weightRef}
            castShadow
            receiveShadow
            geometry={nodes.Weight.geometry}
            material={materials.Weight}
            position={[-0.022, -0.014, -0.057]}
          />
          <mesh
            ref={screenRef}
            castShadow
            receiveShadow
            geometry={nodes.Screen.geometry}
            material={screenMat}
            position={[0.092, 0.001, -0.106]}
            scale={-1}
          />

          {/* All keycap meshes (for hero scroll / scale on keycaps only) */}
          <group ref={keycapsRootRef}>
          {/* Function Row */}
          <group ref={functionRowRef}>
            <mesh
              ref={keyRefs.esc}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_ESC.geometry)}
              material={capMat("esc")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f1}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F1.geometry)}
              material={capMat("f1")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f2}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F2.geometry)}
              material={capMat("f2")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f3}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F3.geometry)}
              material={capMat("f3")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f4}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F4.geometry)}
              material={capMat("f4")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f5}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F5.geometry)}
              material={capMat("f5")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f6}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F6.geometry)}
              material={capMat("f6")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f7}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F7.geometry)}
              material={capMat("f7")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f8}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F8.geometry)}
              material={capMat("f8")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f9}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F9.geometry)}
              material={capMat("f9")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f10}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F10.geometry)}
              material={capMat("f10")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f11}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F11.geometry)}
              material={capMat("f11")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.f12}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F12.geometry)}
              material={capMat("f12")}
              position={[-0.051, 0.01, -0.106]}
            />
            <mesh
              ref={keyRefs.del}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_DEL.geometry)}
              material={capMat("del")}
              position={[-0.165, 0.01, -0.087]}
            />
          </group>

          {/* Number Row */}
          <group ref={numberRowRef}>
            <mesh
              ref={keyRefs.grave}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_GRAVE.geometry)}
              material={capMat("grave")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.one}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_1.geometry)}
              material={capMat("one")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.two}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_2.geometry)}
              material={capMat("two")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.three}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_3.geometry)}
              material={capMat("three")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.four}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_4.geometry)}
              material={capMat("four")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.five}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_5.geometry)}
              material={capMat("five")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.six}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_6.geometry)}
              material={capMat("six")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.seven}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_7.geometry)}
              material={capMat("seven")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.eight}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_8.geometry)}
              material={capMat("eight")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.nine}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_9.geometry)}
              material={capMat("nine")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.zero}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_0.geometry)}
              material={capMat("zero")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.dash}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_DASH.geometry)}
              material={capMat("dash")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.equal}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_EQUAL.geometry)}
              material={capMat("equal")}
              position={[-0.165, 0.01, -0.087]}
            />
            <mesh
              ref={keyRefs.backspace}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_BACKSPACE.geometry)}
              material={capMat("backspace")}
              position={[0.092, 0, -0.087]}
            />
          </group>

          {/* Top Row (QWERTY) */}
          <group ref={topRowRef}>
            <mesh
              ref={keyRefs.tab}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_TAB.geometry)}
              material={capMat("tab")}
              position={[-0.16, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.q}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_Q.geometry)}
              material={capMat("q")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.w}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_W.geometry)}
              material={capMat("w")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.e}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_E.geometry)}
              material={capMat("e")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.r}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_R.geometry)}
              material={capMat("r")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.t}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_T.geometry)}
              material={capMat("t")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.y}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_Y.geometry)}
              material={capMat("y")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.u}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_U.geometry)}
              material={capMat("u")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.i}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_I.geometry)}
              material={capMat("i")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.o}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_O.geometry)}
              material={capMat("o")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.p}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_P.geometry)}
              material={capMat("p")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.lsquarebracket}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_LSQUAREBRACKET.geometry)}
              material={capMat("lsquarebracket")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.rsquarebracket}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_RSQUAREBRACKET.geometry)}
              material={capMat("rsquarebracket")}
              position={[-0.136, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.backslash}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_BACKSLASH.geometry)}
              material={capMat("backslash")}
              position={[-0.16, 0.008, -0.068]}
            />
            <mesh
              ref={keyRefs.pageup}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_PAGEUP.geometry)}
              material={capMat("pageup")}
              position={[-0.136, 0.008, -0.068]}
            />
          </group>

          {/* Home Row (ASDF) */}
          <group ref={homeRowRef}>
            <mesh
              ref={keyRefs.caps}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_CAPS.geometry)}
              material={capMat("caps")}
              position={[-0.158, 0, -0.049]}
            />
            <mesh
              ref={keyRefs.a}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_A.geometry)}
              material={capMat("a")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.s}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_S.geometry)}
              material={capMat("s")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.d}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_D.geometry)}
              material={capMat("d")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.f}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_F.geometry)}
              material={capMat("f")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.g}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_G.geometry)}
              material={capMat("g")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.h}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_H.geometry)}
              material={capMat("h")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.j}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_J.geometry)}
              material={capMat("j")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.k}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_K.geometry)}
              material={capMat("k")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.l}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_L.geometry)}
              material={capMat("l")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.semicolon}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_SEMICOLON.geometry)}
              material={capMat("semicolon")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.quote}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_QUOTE.geometry)}
              material={capMat("quote")}
              position={[-0.132, 0.007, -0.049]}
            />
            <mesh
              ref={keyRefs.enter}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_ENTER.geometry)}
              material={capMat("enter")}
              position={[0.09, 0, -0.049]}
            />
            <mesh
              ref={keyRefs.pagedown}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_PAGEDOWN.geometry)}
              material={capMat("pagedown")}
              position={[-0.132, 0.007, -0.049]}
            />
          </group>

          {/* Bottom Row (ZXCV) */}
          <group ref={bottomRowRef}>
            <mesh
              ref={keyRefs.lshift}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_LSHIFT.geometry)}
              material={capMat("lshift")}
              position={[-0.153, 0, -0.03]}
            />
            <mesh
              ref={keyRefs.z}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_Z.geometry)}
              material={capMat("z")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.x}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_X.geometry)}
              material={capMat("x")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.c}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_C.geometry)}
              material={capMat("c")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.v}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_V.geometry)}
              material={capMat("v")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.b}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_B.geometry)}
              material={capMat("b")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.n}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_N.geometry)}
              material={capMat("n")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.m}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_M.geometry)}
              material={capMat("m")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.comma}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_COMMA.geometry)}
              material={capMat("comma")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.period}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_PERIOD.geometry)}
              material={capMat("period")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.slash}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_SLASH.geometry)}
              material={capMat("slash")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.rshift}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_RSHIFT.geometry)}
              material={capMat("rshift")}
              position={[0.076, 0, -0.03]}
            />
            <mesh
              ref={keyRefs.arrowup}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_ARROWUP.geometry)}
              material={capMat("arrowup")}
              position={[-0.122, 0.008, -0.03]}
            />
            <mesh
              ref={keyRefs.end}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_END.geometry)}
              material={capMat("end")}
              position={[-0.122, 0.008, -0.03]}
            />
          </group>

          {/* Modifiers */}
          <group ref={modifiersRef}>
            <mesh
              ref={keyRefs.lcontrol}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_LCONTROL.geometry)}
              material={capMat("lcontrol")}
              position={[-0.162, 0.008, -0.011]}
            />
            <mesh
              ref={keyRefs.lwin}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_LWIN.geometry)}
              material={capMat("lwin")}
              position={[-0.162, 0.008, -0.011]}
            />
            <mesh
              ref={keyRefs.lalt}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_LALT.geometry)}
              material={capMat("lalt")}
              position={[-0.162, 0.008, -0.011]}
            />
            <mesh
              ref={keyRefs.space}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_SPACE.geometry)}
              material={capMat("space")}
              position={[-0.043, 0, -0.01]}
            />
            <mesh
              ref={keyRefs.ralt}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_RALT.geometry)}
              material={capMat("ralt")}
              position={[-0.162, 0.008, -0.011]}
            />
            <mesh
              ref={keyRefs.fn}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_FN.geometry)}
              material={capMat("fn")}
              position={[-0.162, 0.008, -0.011]}
            />
          </group>

          {/* Arrow Keys */}
          <group ref={arrowsRef}>
            <mesh
              ref={keyRefs.arrowleft}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_ARROWLEFT.geometry)}
              material={capMat("arrowleft")}
              position={[0.083, 0.008, -0.011]}
            />
            <mesh
              ref={keyRefs.arrowdown}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_ARROWDOWN.geometry)}
              material={capMat("arrowdown")}
              position={[0.083, 0.008, -0.011]}
            />
            <mesh
              ref={keyRefs.arrowright}
              castShadow
              receiveShadow
              geometry={keycapGeo(nodes.K_ARROWRIGHT.geometry)}
              material={capMat("arrowright")}
              position={[0.083, 0.008, -0.011]}
            />
          </group>
          </group>

          {/* Keycap legend overlay — single plane/texture, only in Garage mode */}
          {garageGroupMaterials && garageKeycapTheme && (
            <KeyboardLabelOverlay nodes={nodes} legendColor={garageKeycapTheme.legend} />
          )}

          <instancedMesh
            args={[nodes["2U_Wires"].geometry, materials.Gold, 3]}
            castShadow
            receiveShadow
            instanceMatrix={nodes["2U_Wires"].instanceMatrix}
            position={[0.092, 0.009, -0.086]}
          />
          <instancedMesh
            args={[nodes.Stab_Housing_Instances.geometry, materials.Stem, 8]}
            castShadow
            receiveShadow
            instanceMatrix={nodes.Stab_Housing_Instances.instanceMatrix}
            position={[0.08, -0.004, -0.085]}
          />
        </group>
      </group>
    );
  },
);

Keyboard.displayName = "Keyboard";

useGLTF.preload("/keyboard.gltf");
