import { lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import type { GltfKeyboardViewerProps } from "./gltf-keyboard-viewer";

const GltfKeyboardViewer = lazy(() => import("./gltf-keyboard-viewer"));

function KeyboardPoster({ embedded = false }: { embedded?: boolean }) {
  return (
    <div
      className={cn(
        "relative z-[1] flex justify-center",
        embedded
          ? "w-full max-w-full"
          : "w-screen max-w-[min(920px,100vw)]",
      )}
      role="img"
      aria-label="Loading Specter 75 keyboard 3D preview"
    >
      <div
        className={cn(
          "relative w-full max-w-full",
          embedded
            ? "aspect-16/10 min-h-[240px] max-h-[min(460px,55dvh)]"
            : "h-[min(460px,62vw)] min-h-[300px] sm:min-h-[340px]",
        )}
      >
        <img
          src="/landing.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}

export default function LazyGltfKeyboardViewer(
  props: GltfKeyboardViewerProps,
) {
  return (
    <Suspense fallback={<KeyboardPoster embedded={props.embedded} />}>
      <GltfKeyboardViewer {...props} />
    </Suspense>
  );
}
