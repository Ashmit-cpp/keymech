import { memo, Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  animate,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { Scene } from "@/components/scene";
import { cn } from "@/lib/utils";
import { COLORWAYS, KEYCAP_TEXTURES } from "@/lib/constants";
import type { GarageKeycapTheme } from "@/lib/garage-theme";

type Colorway = (typeof COLORWAYS)[number];
type KeycapTextureId = (typeof KEYCAP_TEXTURES)[number]["id"];

function DragMotionInvalidate({
  dragRx,
  dragRy,
}: {
  dragRx: MotionValue<number>;
  dragRy: MotionValue<number>;
}) {
  const invalidate = useThree((s) => s.invalidate);
  useMotionValueEvent(dragRx, "change", invalidate);
  useMotionValueEvent(dragRy, "change", invalidate);
  return null;
}

interface GltfKeyboardViewerProps {
  baseRotateX?: MotionValue<number> | number;
  baseRotateY?: MotionValue<number> | number;
  baseRotateZ?: MotionValue<number> | number;
  activeColorway?: Colorway;
  /** When set, keycaps use grouped garage colors while keeping the hero texture map. */
  garageKeycapTheme?: GarageKeycapTheme;
  selectedTextureId?: KeycapTextureId;
  isInteractive?: boolean;
  isHeroKeyboardInView?: boolean;
  /** Use full width of parent instead of viewport (e.g. Garage embedded preview). */
  embedded?: boolean;
  viewMode?: "3d" | "explode" | "top" | "side" | "front";
}

function GltfKeyboardViewer({
  baseRotateX = 28,
  baseRotateY = -8,
  baseRotateZ = 0,
  activeColorway,
  garageKeycapTheme,
  selectedTextureId = KEYCAP_TEXTURES[0].id,
  isInteractive = true,
  isHeroKeyboardInView = false,
  embedded = false,
  viewMode = "3d",
}: GltfKeyboardViewerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, rx: 0, ry: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const dragRx = useMotionValue(0);
  const dragRy = useMotionValue(0);

  const fallbackRx = useMotionValue(
    typeof baseRotateX === "number" ? baseRotateX : 0,
  );
  const fallbackRy = useMotionValue(
    typeof baseRotateY === "number" ? baseRotateY : 0,
  );
  const fallbackRz = useMotionValue(
    typeof baseRotateZ === "number" ? baseRotateZ : 0,
  );

  const mvRx = typeof baseRotateX === "number" ? fallbackRx : baseRotateX;
  const mvRy = typeof baseRotateY === "number" ? fallbackRy : baseRotateY;
  const mvRz = typeof baseRotateZ === "number" ? fallbackRz : baseRotateZ;

  useEffect(() => {
    const duration = 0.8;
    const ease = "easeInOut";

    let targetBaseX = 28;
    let targetBaseY = -8;
    let targetBaseZ = 0;

    if (viewMode === "top") {
      targetBaseX = 90;
      targetBaseY = 0;
    } else if (viewMode === "side") {
      targetBaseX = 0;
      targetBaseY = -90;
    } else if (viewMode === "front") {
      targetBaseX = 0;
      targetBaseY = 0;
    } else if (viewMode === "3d" || viewMode === "explode") {
      targetBaseX = 28;
      targetBaseY = -8;
    }

    animate(mvRx, targetBaseX, { duration, ease });
    animate(mvRy, targetBaseY, { duration, ease });
    animate(mvRz, targetBaseZ, { duration, ease });
    
    animate(dragRx, 0, { duration, ease });
    animate(dragRy, 0, { duration, ease });
  }, [viewMode, mvRx, mvRy, mvRz, dragRx, dragRy]);

  const finalRotateX = useTransform([mvRx, dragRx], ([base, drag]: number[]) =>
    base + drag,
  );
  const finalRotateY = useTransform([mvRy, dragRy], ([base, drag]: number[]) =>
    base + drag,
  );

  const interactive = isInteractive && !prefersReducedMotion;

  const previewAriaLabel =
    interactive && isInteractive
      ? "Specter 75 keyboard 3D preview — drag or swipe to rotate"
      : "Specter 75 keyboard 3D preview";

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive || viewMode !== "3d") return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rx: dragRx.get(),
      ry: dragRy.get(),
    };
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !interactive || viewMode !== "3d") return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    dragRx.set(Math.max(-60, Math.min(60, dragStart.current.rx - dy * 0.4)));
    dragRy.set(dragStart.current.ry + dx * 0.4);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    stageRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={stageRef}
      className={cn(
        "relative z-[1] flex justify-center",
        embedded
          ? "w-full max-w-full"
          : "w-screen max-w-[min(920px,100vw)]",
      )}
      style={{
        cursor: interactive ? (isDragging ? "grabbing" : "grab") : "default",
        pointerEvents: "auto",
        touchAction: interactive ? "none" : "auto",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="pointer-events-none absolute -bottom-[8%] left-1/2 z-0 h-[55%] w-[min(920px,110%)] -translate-x-1/2 "
      />
      <div
        className={cn(
          "relative z-[1] w-full max-w-full",
          embedded
            ? "aspect-16/10 min-h-[240px] max-h-[min(460px,55dvh)]"
            : "h-[min(460px,62vw)] min-h-[300px] sm:min-h-[340px]",
        )}
        role="img"
        aria-label={previewAriaLabel}
      >
        <Canvas
          className="h-full w-full"
          frameloop="demand"
          dpr={[1, 2]}
          shadows
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          camera={{
            position: [0, 0, 2.85],
            fov: 42,
            near: 0.08,
            far: 100,
          }}
          onCreated={({ gl, invalidate }) => {
            gl.setClearColor(0x000000, 0);
            invalidate();
          }}
        >
          <Suspense fallback={null}>
            <DragMotionInvalidate dragRx={dragRx} dragRy={dragRy} />
            <Scene
              rotateX={finalRotateX}
              rotateY={finalRotateY}
              rotateZ={mvRz}
              activeColorway={activeColorway}
              garageKeycapTheme={garageKeycapTheme}
              selectedTextureId={selectedTextureId}
              isHeroKeyboardInView={isHeroKeyboardInView}
              viewMode={viewMode}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default memo(GltfKeyboardViewer);
