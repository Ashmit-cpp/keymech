import { Keyboard, type KeyboardRefs } from "@/components/3d-keyboard";
import { COLORWAYS, KEYCAP_TEXTURES } from "@/lib/constants";
import type { GarageKeycapTheme } from "@/lib/garage-theme";
import { useGSAP } from "@gsap/react";
import {
  Center,
  Environment,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MotionValue } from "motion/react";
import { useMotionValueEvent } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import * as THREE from "three";

type Colorway = (typeof COLORWAYS)[number];
type KeycapTextureId = (typeof KEYCAP_TEXTURES)[number]["id"];

function getKeycapTextureConfig(textureId: KeycapTextureId) {
  return (
    KEYCAP_TEXTURES.find((texture) => texture.id === textureId) ??
    KEYCAP_TEXTURES[0]
  );
}

function prepareKeycapTexture(texture: THREE.Texture) {
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createKeycapMaterial(texture: THREE.Texture) {
  return new THREE.MeshStandardMaterial({
    map: prepareKeycapTexture(texture),
    roughness: 0.6,
  });
}

gsap.registerPlugin(useGSAP, ScrollTrigger);

const KEYBOARD_COLUMNS = [
  ["esc", "grave", "tab", "caps", "lshift", "lcontrol"],
  ["f1", "one", "q", "a", "z", "lalt"],
  ["f2", "two", "w", "s", "x", "lwin"],
  ["f3", "three", "e", "d", "c"],
  ["f4", "four", "r", "f", "v"],
  ["f5", "five", "t", "g", "b", "space"],
  ["f6", "six", "y", "h", "n"],
  ["f7", "seven", "u", "j", "m"],
  ["f8", "eight", "i", "k", "comma"],
  ["f9", "nine", "o", "l", "period"],
  ["f10", "zero", "dash", "p", "semicolon", "slash", "ralt"],
  [
    "f11",
    "lsquarebracket",
    "quote",
    "rshift",
    "fn",
    "arrowleft",
    "rsquarebracket",
    "enter",
    "f12",
    "equal",
    "arrowup",
  ],
  [],
  [
    "del",
    "backspace",
    "backslash",
    "pagedown",
    "end",
    "arrowdown",
    "pageup",
    "arrowright",
  ],
] as const;

function isMesh(keycap: THREE.Mesh | null | undefined): keycap is THREE.Mesh {
  return Boolean(keycap);
}

function addKeyboardWaveToTimeline({
  scrollTimeline,
  individualKeys,
  invalidate,
}: {
  scrollTimeline: gsap.core.Timeline;
  individualKeys: KeyboardRefs["keys"];
  invalidate: () => void;
}) {
  const keyCapsByColumn = KEYBOARD_COLUMNS.map((column) =>
    column
      .map((keyName) => individualKeys[keyName]?.current)
      .filter(isMesh),
  );

  keyCapsByColumn.forEach((columnKeycaps, columnIndex) => {
    if (columnKeycaps.length === 0) return;

    const waveProgress = columnIndex / (KEYBOARD_COLUMNS.length - 1);
    const waveStartTime = waveProgress * 2 + 0.5;
    const keycapPositions = columnKeycaps.map((keycap) => keycap.position);

    scrollTimeline.to(
      keycapPositions,
      {
        y: "+=0.08",
        duration: 0.5,
        ease: "power2.inOut",
        onUpdate: invalidate,
      },
      waveStartTime,
    );

    scrollTimeline.to(
      keycapPositions,
      {
        y: "-=0.08",
        duration: 0.5,
        ease: "power2.inOut",
        onUpdate: invalidate,
      },
      waveStartTime + 0.5,
    );
  });
}

function CameraController({ viewMode }: { viewMode: string }) {
  const { camera, size, invalidate } = useThree();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const currentPositionRef = useRef(new THREE.Vector3(0, 0, 2.85));
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const baseCameraPosition = {
    x: 0,
    y: 0,
    z: viewMode === "explode" ? 3.65 : 2.85,
  };

  useFrame(() => {
    const mouse = mouseRef.current;

    if (prefersReducedMotion || viewMode !== "3d") {
      camera.position.set(
        baseCameraPosition.x,
        baseCameraPosition.y,
        baseCameraPosition.z,
      );
      camera.lookAt(targetRef.current);
      return;
    }

    const tiltX = (mouse.y - 0.5) * 0.3;
    const tiltY = (mouse.x - 0.5) * 0.3;

    const targetPosition = new THREE.Vector3(
      baseCameraPosition.x + tiltY,
      baseCameraPosition.y - tiltX,
      baseCameraPosition.z,
    );

    currentPositionRef.current.lerp(targetPosition, 0.1);

    camera.position.copy(currentPositionRef.current);
    camera.lookAt(targetRef.current);
    invalidate();
  });

  useEffect(() => {
    if (prefersReducedMotion || viewMode !== "3d") return;

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX / size.width;
      mouseRef.current.y = event.clientY / size.height;
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [prefersReducedMotion, size, viewMode]);

  return null;
}

function MotionInvalidateScene({
  rotateX,
  rotateY,
  rotateZ,
}: {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  rotateZ: MotionValue<number>;
}) {
  const invalidate = useThree((s) => s.invalidate);
  useMotionValueEvent(rotateX, "change", invalidate);
  useMotionValueEvent(rotateY, "change", invalidate);
  useMotionValueEvent(rotateZ, "change", invalidate);
  return null;
}

interface KeyboardRotationProps {
  groupRef: RefObject<THREE.Group | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  rotateZ: MotionValue<number>;
}

function KeyboardRotation({
  groupRef,
  rotateX,
  rotateY,
  rotateZ,
}: KeyboardRotationProps) {
  const deg = Math.PI / 180;
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.order = "YXZ";
    g.rotation.x = rotateX.get() * deg;
    g.rotation.y = rotateY.get() * deg;
    g.rotation.z = rotateZ.get() * deg;
  });
  return null;
}

export interface SceneProps {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  rotateZ: MotionValue<number>;
  activeColorway?: Colorway;
  garageKeycapTheme?: GarageKeycapTheme;
  selectedTextureId?: KeycapTextureId;
  isHeroKeyboardInView: boolean;
  viewMode?: "3d" | "explode" | "top" | "side" | "front";
  onReady?: () => void;
}

export function Scene({
  rotateX,
  rotateY,
  rotateZ,
  activeColorway,
  garageKeycapTheme,
  selectedTextureId = KEYCAP_TEXTURES[0].id,
  isHeroKeyboardInView,
  viewMode = "3d",
  onReady,
}: SceneProps) {
  const invalidate = useThree((s) => s.invalidate);
  const keyboardGroupRef = useRef<THREE.Group>(null);
  const keyboardAnimationRef = useRef<KeyboardRefs | null>(null);
  const [keyboardRefsReady, setKeyboardRefsReady] = useState(false);
  const [initialTextureConfig] = useState(() =>
    getKeycapTextureConfig(selectedTextureId),
  );
  const initialTexture = useTexture(initialTextureConfig.path);
  const initialKeycapMaterial = useMemo(
    () => createKeycapMaterial(initialTexture),
    [initialTexture],
  );
  const [currentTextureId, setCurrentTextureId] =
    useState<KeycapTextureId>(initialTextureConfig.id);
  const [keycapMaterials, setKeycapMaterials] = useState<
    Partial<Record<KeycapTextureId, THREE.MeshStandardMaterial>>
  >(() => ({ [initialTextureConfig.id]: initialKeycapMaterial }));
  const loadingTextureIds = useRef(new Set<KeycapTextureId>());

  useEffect(() => {
    const textureConfig = getKeycapTextureConfig(selectedTextureId);
    if (
      keycapMaterials[textureConfig.id] ||
      loadingTextureIds.current.has(textureConfig.id)
    ) {
      return;
    }

    let cancelled = false;
    loadingTextureIds.current.add(textureConfig.id);

    new THREE.TextureLoader().load(
      textureConfig.path,
      (texture) => {
        loadingTextureIds.current.delete(textureConfig.id);
        if (cancelled) {
          texture.dispose();
          return;
        }

        const material = createKeycapMaterial(texture);
        setKeycapMaterials((materials) => ({
          ...materials,
          [textureConfig.id]: material,
        }));
        invalidate();
      },
      undefined,
      () => {
        loadingTextureIds.current.delete(textureConfig.id);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [selectedTextureId, keycapMaterials, invalidate]);

  const currentKnobColor =
    KEYCAP_TEXTURES.find((texture) => texture.id === currentTextureId)
      ?.knobColor ?? KEYCAP_TEXTURES[0].knobColor;
  const currentCaseColor =
    KEYCAP_TEXTURES.find((texture) => texture.id === currentTextureId)
      ?.caseColor ?? KEYCAP_TEXTURES[0].caseColor;
  const keycapAtlasUsesUv2 =
    KEYCAP_TEXTURES.find((texture) => texture.id === currentTextureId)
      ?.atlasUsesUv2 ?? true;

  const setKeyboardAnimationRef = useCallback((refs: KeyboardRefs | null) => {
    keyboardAnimationRef.current = refs;
    setKeyboardRefsReady(Boolean(refs));
  }, []);

  useEffect(() => {
    if (keyboardRefsReady) onReady?.();
  }, [keyboardRefsReady, onReady]);

  useGSAP(
    () => {
      if (!isHeroKeyboardInView || !keyboardRefsReady) return;

      const individualKeys = keyboardAnimationRef.current?.keys;
      if (!individualKeys) return;

      const mm = gsap.matchMedia();
      let scrollTimeline: gsap.core.Timeline | null = null;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        scrollTimeline = gsap.timeline({
          onUpdate: invalidate,
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: () => invalidate(),
          },
        });

        addKeyboardWaveToTimeline({
          scrollTimeline,
          individualKeys,
          invalidate,
        });

        ScrollTrigger.refresh();
        invalidate();

        return () => {
          scrollTimeline?.kill();
        };
      });

      return () => {
        scrollTimeline?.kill();
        mm.revert();
      };
    },
    {
      dependencies: [isHeroKeyboardInView, keyboardRefsReady, invalidate],
      revertOnUpdate: true,
    },
  );

  useGSAP(
    () => {
      if (selectedTextureId === currentTextureId) return;
      if (!keycapMaterials[selectedTextureId]) return;

      const keyboard = keyboardGroupRef.current;
      if (!keyboard) {
        setCurrentTextureId(selectedTextureId);
        invalidate();
        return;
      }

      const mm = gsap.matchMedia();
      let textureTimeline: gsap.core.Timeline | null = null;

      mm.add("(prefers-reduced-motion: reduce)", () => {
        setCurrentTextureId(selectedTextureId);
        invalidate();
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        textureTimeline = gsap.timeline({
          onUpdate: invalidate,
          onComplete: invalidate,
        });

        textureTimeline.to(keyboard.position, {
          y: 0.3,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            setCurrentTextureId(selectedTextureId);
            invalidate();
          },
        });

        textureTimeline.to(keyboard.position, {
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1,0.4)",
        });
      });

      return () => {
        textureTimeline?.kill();
        mm.revert();
      };
    },
    {
      dependencies: [
        selectedTextureId,
        currentTextureId,
        keycapMaterials,
        invalidate,
      ],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    const refs = keyboardAnimationRef.current;
    if (!refs) return;

    const duration = 0.8;
    const ease = "power2.out";
    const isExploded = viewMode === "explode";

    const targetY = isExploded
      ? {
          keycaps: 0.09,
          knob: 0.07,
          switches: 0.05,
          screen: 0.04,
          plate: 0.02,
          pcb: 0.00,
          topCase: -0.005,
          bottomCase: -0.025,
          weight: -0.04,
        }
      : {
          keycaps: 0,
          knob: 0.004,
          switches: 0,
          screen: 0.001,
          plate: -0.006,
          pcb: -0.009,
          topCase: -0.014,
          bottomCase: -0.014,
          weight: -0.014,
        };

    // Animate keycapsRoot
    if (refs.keycapsRoot.current) {
      gsap.to(refs.keycapsRoot.current.position, {
        y: targetY.keycaps,
        duration,
        ease,
        onUpdate: invalidate,
      });
    }

    // Animate knob
    if (refs.knob.current) {
      gsap.to(refs.knob.current.position, {
        y: targetY.knob,
        duration,
        ease,
        onUpdate: invalidate,
      });
    }

    // Animate switches groups
    if (refs.switches) {
      Object.values(refs.switches).forEach((switchGroupRef) => {
        if (switchGroupRef.current) {
          gsap.to(switchGroupRef.current.position, {
            y: targetY.switches,
            duration,
            ease,
            onUpdate: invalidate,
          });
        }
      });
    }

    // Animate screen
    if (refs.screen.current) {
      gsap.to(refs.screen.current.position, {
        y: targetY.screen,
        duration,
        ease,
        onUpdate: invalidate,
      });
    }

    // Animate plate
    if (refs.plate.current) {
      gsap.to(refs.plate.current.position, {
        y: targetY.plate,
        duration,
        ease,
        onUpdate: invalidate,
      });
    }

    // Animate pcb
    if (refs.pcb.current) {
      gsap.to(refs.pcb.current.position, {
        y: targetY.pcb,
        duration,
        ease,
        onUpdate: invalidate,
      });
    }

    // Animate topCase
    if (refs.topCase.current) {
      gsap.to(refs.topCase.current.position, {
        y: targetY.topCase,
        duration,
        ease,
        onUpdate: invalidate,
      });
    }

    // Animate bottomCase
    if (refs.bottomCase.current) {
      gsap.to(refs.bottomCase.current.position, {
        y: targetY.bottomCase,
        duration,
        ease,
        onUpdate: invalidate,
      });
    }

    // Animate weight
    if (refs.weight.current) {
      gsap.to(refs.weight.current.position, {
        y: targetY.weight,
        duration,
        ease,
        onUpdate: invalidate,
      });
    }
  }, [viewMode, keyboardRefsReady, invalidate]);

  // Hero already applies CSS scale on narrow viewports; keep 3D group near full size.
  const scalingFactor =
    typeof window !== "undefined" && window.innerWidth <= 500 ? 0.77 : 1;

  return (
    <group>
      <MotionInvalidateScene
        rotateX={rotateX}
        rotateY={rotateY}
        rotateZ={rotateZ}
      />
      <KeyboardRotation
        groupRef={keyboardGroupRef}
        rotateX={rotateX}
        rotateY={rotateY}
        rotateZ={rotateZ}
      />
      <CameraController viewMode={viewMode} />
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 2.85]}
        fov={42}
        near={0.08}
        far={100}
      />

      <group scale={scalingFactor}>
        <group ref={keyboardGroupRef}>
          <Center>
            <Keyboard
              ref={setKeyboardAnimationRef}
              scale={10}
              activeColorway={activeColorway}
              garageKeycapTheme={garageKeycapTheme}
              keycapAtlasUsesUv2={keycapAtlasUsesUv2}
              keycapMaterial={keycapMaterials[currentTextureId]}
              knobColor={currentKnobColor}
              caseColor={currentCaseColor}
            />
          </Center>
        </group>
      </group>

      <Environment
        files={["/hdr/blue-studio.hdr"]}
        environmentIntensity={0.3}
      />

      <spotLight
        position={[0, 3, 4]}
        intensity={70}
        castShadow
        penumbra={0}
        shadow-mapSize={[1024, 1024]}
      />
    </group>
  );
}
