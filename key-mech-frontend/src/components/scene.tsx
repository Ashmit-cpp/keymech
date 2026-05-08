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

function CameraController() {
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
    z: 2.85,
  };

  useFrame(() => {
    const mouse = mouseRef.current;

    if (prefersReducedMotion) {
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
    if (prefersReducedMotion) return;

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = event.clientX / size.width;
      mouseRef.current.y = event.clientY / size.height;
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [prefersReducedMotion, size]);

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
}

export function Scene({
  rotateX,
  rotateY,
  rotateZ,
  activeColorway,
  garageKeycapTheme,
  selectedTextureId = KEYCAP_TEXTURES[0].id,
  isHeroKeyboardInView,
}: SceneProps) {
  const invalidate = useThree((s) => s.invalidate);
  const keyboardGroupRef = useRef<THREE.Group>(null);
  const keyboardAnimationRef = useRef<KeyboardRefs | null>(null);
  const [keyboardRefsReady, setKeyboardRefsReady] = useState(false);
  const [currentTextureId, setCurrentTextureId] =
    useState<KeycapTextureId>(selectedTextureId);

  const texturePaths = useMemo(() => KEYCAP_TEXTURES.map((t) => t.path), []);
  const loadedTextures = useTexture(texturePaths);

  const keycapMaterials = useMemo(() => {
    const materialMap: Partial<Record<KeycapTextureId, THREE.MeshStandardMaterial>> =
      {};
    const textures = Array.isArray(loadedTextures)
      ? loadedTextures
      : [loadedTextures];

    KEYCAP_TEXTURES.forEach((textureConfig, index) => {
      const texture = textures[index];
      if (!texture) return;

      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      materialMap[textureConfig.id] = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.6,
      });
    });

    return materialMap;
  }, [loadedTextures]);

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
      dependencies: [selectedTextureId, invalidate],
      revertOnUpdate: true,
    },
  );

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
      <CameraController />
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
