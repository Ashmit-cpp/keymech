import { Keyboard } from "@/components/3d-keyboard";
import { COLORWAYS } from "@/lib/constants";
import { Center, Environment, PerspectiveCamera } from "@react-three/drei";

type Colorway = (typeof COLORWAYS)[number];
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { useMotionValueEvent } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

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
  }, [size]);

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
}

export function Scene({ rotateX, rotateY, rotateZ, activeColorway }: SceneProps) {
  const keyboardGroupRef = useRef<THREE.Group>(null);
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
            <Keyboard scale={10} activeColorway={activeColorway} />
          </Center>
        </group>
      </group>

      <Environment
        files={["/hdr/blue-studio.hdr"]}
        environmentIntensity={0.2}
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
