import { memo, Suspense, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { Scene } from "@/components/scene";
import { COLORWAYS } from "@/lib/constants";

type Colorway = (typeof COLORWAYS)[number];

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
  isInteractive?: boolean;
}

function GltfKeyboardViewer({
  baseRotateX = 28,
  baseRotateY = -8,
  baseRotateZ = 0,
  activeColorway,
  isInteractive = true,
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

  const finalRotateX = useTransform([mvRx, dragRx], ([base, drag]: number[]) =>
    base + drag,
  );
  const finalRotateY = useTransform([mvRy, dragRy], ([base, drag]: number[]) =>
    base + drag,
  );

  const interactive = isInteractive && !prefersReducedMotion;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
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
    if (!isDraggingRef.current || !interactive) return;
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
      className="relative z-[1] flex max-w-[min(920px,100vw)] justify-center w-screen"
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
        className="relative z-[1] h-[min(460px,62vw)] w-full min-h-[300px] sm:min-h-[340px]"
        role="img"
        aria-label="Specter 75 keyboard 3D preview — drag to rotate"
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
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default memo(GltfKeyboardViewer);
