import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSpring, useMotionValue, useReducedMotion } from "motion/react";
import { COLORWAYS, KEYCAP_TEXTURES } from "@/lib/constants";

type KeycapTexture = (typeof KEYCAP_TEXTURES)[number];
type KeycapTextureId = KeycapTexture["id"];

interface KeyboardPos {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rz: number;
}

/** Targets at design width `DESIGN_WIDTH` (x as px offset; y in px). */
interface KeyboardBlueprint {
  xRef: number;
  y: number;
  rx: number;
  ry: number;
  rz: number;
}

const BLUEPRINTS: Record<string, KeyboardBlueprint> = {
  hero: { xRef: 0, y: 15, rx: 62, ry: 0, rz: 0 },
  build: { xRef: 300, y: 30, rx: 90, ry: 0, rz: 0 },
  inside: { xRef: 340, y: 40, rx: 45, ry: 20, rz: 10 },
};

interface MobilePortraitBlueprint {
  yVh: number;
  rx: number;
  ry: number;
  rz: number;
}

const MOBILE_BLUEPRINTS: Record<string, MobilePortraitBlueprint> = {
  hero: { yVh: -0.2, rx: 62, ry: 0, rz: 0 },
  build: { yVh: 0, rx: 4, ry: 0, rz: 0 },
  inside: { yVh: -0.2, rx: 40, ry: 16, rz: -12 },
};

const DESIGN_WIDTH = 1280;
const NARROW_BREAKPOINT = 768;
const SHORT_VIEWPORT = 720;

const SPRING = { stiffness: 115, damping: 24, mass: 1 };
/** Slightly softer on mobile so vertical moves feel less snappy than desktop x-travel. */
const SPRING_MOBILE = { stiffness: 92, damping: 28, mass: 1 };

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function resolveKeyboardPos(
  b: KeyboardBlueprint,
  layoutWidth: number,
): KeyboardPos {
  const widthRatio = clamp(layoutWidth / DESIGN_WIDTH, 0.28, 1.35);
  const xMax = layoutWidth * 0.36;
  const x = clamp(b.xRef * widthRatio, -layoutWidth * 0.04, xMax);
  return { x, y: b.y, rx: b.rx, ry: b.ry, rz: b.rz };
}

function resolveMobilePortraitPos(
  b: MobilePortraitBlueprint,
  viewportHeight: number,
): KeyboardPos {
  return { x: 0, y: b.yVh * viewportHeight, rx: b.rx, ry: b.ry, rz: b.rz };
}

export function useHero(rootRef: RefObject<HTMLElement | null>) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [layoutWidth, setLayoutWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : DESIGN_WIDTH,
  );
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const [isHeroKeyboardInView, setIsHeroKeyboardInView] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const readViewport = () => {
      setViewportHeight(window.innerHeight);
    };

    const el = rootRef.current;
    if (!el) {
      const sync = () => {
        readViewport();
        setLayoutWidth(window.innerWidth);
      };
      sync();
      window.addEventListener("resize", sync, { passive: true });
      return () => window.removeEventListener("resize", sync);
    }

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w > 0) setLayoutWidth(w);
      readViewport();
    });
    const w0 = el.getBoundingClientRect().width;
    if (w0 > 0) setLayoutWidth(w0);
    ro.observe(el);
    window.addEventListener("resize", readViewport, { passive: true });
    readViewport();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", readViewport);
    };
  }, [rootRef]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroKeyboardInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootRef]);

  const isNarrow = layoutWidth < NARROW_BREAKPOINT;
  const isKeyboardInteractive = !isNarrow;

  const handleShopKeyboards = useCallback(() => {
    navigate("/category/keyboards");
  }, [navigate]);

  const handleExploreBuilds = useCallback(() => {
    navigate("/products");
  }, [navigate]);

  const xBase = useMotionValue(0);
  const yBase = useMotionValue(240);
  const rxBase = useMotionValue(20);
  const ryBase = useMotionValue(0);
  const rzBase = useMotionValue(0);

  const mobileSpring = isNarrow ? SPRING_MOBILE : SPRING;

  const x = useSpring(xBase, mobileSpring);
  const y = useSpring(yBase, mobileSpring);
  const rx = useSpring(rxBase, mobileSpring);
  const ry = useSpring(ryBase, mobileSpring);
  const rz = useSpring(rzBase, mobileSpring);

  const [activeColorway, setActiveColorway] = useState<(typeof COLORWAYS)[0]>(
    COLORWAYS[0],
  );
  const [selectedTextureId, setSelectedTextureId] = useState<KeycapTextureId>(
    KEYCAP_TEXTURES[0].id,
  );
  const colorwayChanging = useRef(false);

  const applyColorway = useCallback((cw: (typeof COLORWAYS)[0]) => {
    if (colorwayChanging.current) return;
    colorwayChanging.current = true;
    setActiveColorway(cw);
    requestAnimationFrame(() => {
      const root = document.documentElement;
      Object.entries(cw.vars).forEach(([k, v]) =>
        root.style.setProperty(k, v as string),
      );
      colorwayChanging.current = false;
    });
  }, []);

  const applyTexture = useCallback((texture: KeycapTexture) => {
    setSelectedTextureId(texture.id);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(COLORWAYS[0].vars).forEach(([k, v]) =>
      root.style.setProperty(k, v as string),
    );
  }, []);

  const floatY = useMotionValue(0);
  const isScrolling = useRef(false);
  const floatFrameRef = useRef<number | null>(null);
  const floatT = useRef(0);

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      isScrolling.current = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling.current = false;
      }, 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      if (!isScrolling.current && !prefersReducedMotion) {
        floatT.current += 0.016;
        const amp = layoutWidth < NARROW_BREAKPOINT ? 5 : 10;
        floatY.set(Math.sin(floatT.current * (Math.PI / 2)) * amp);
      }
      floatFrameRef.current = requestAnimationFrame(tick);
    };
    floatFrameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimeout);
      if (floatFrameRef.current) cancelAnimationFrame(floatFrameRef.current);
    };
  }, [floatY, prefersReducedMotion, layoutWidth]);

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(
    new Set(),
  );

  // On mobile, require the section to be solidly centred in the viewport
  // before switching the keyboard blueprint (prevents early triggers).
  // Desktop: use the full viewport (0px margins). Negative vertical margins
  // shrink the intersection root; a section that only occupies the top or bottom
  // band of the screen then fails to intersect, the active blueprint falls back to
  // hero, and the sticky keyboard can jump off-screen or look like it vanished.
  const ioMarginY = isNarrow
    ? "-32% 0px -32% 0px"
    : viewportHeight < SHORT_VIEWPORT
      ? "-5% 0px -5% 0px"
      : "0px 0px 0px 0px";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-section"));
          setVisibleSections((prev) => {
            const next = new Set(prev);
            if (entry.isIntersecting) next.add(idx);
            else next.delete(idx);
            return next;
          });
        });
      },
      { rootMargin: ioMarginY, threshold: 0 },
    );
    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ioMarginY]);

  const registerSection = useCallback((el: HTMLElement | null, idx: number) => {
    sectionRefs.current[idx] = el;
  }, []);

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!entered) return;

    let key: keyof typeof BLUEPRINTS = "hero";
    // Section 3 (Group Buy) uses the same pose as "What's inside" — no separate zoom/pan.
    if (visibleSections.has(2) || (!isNarrow && visibleSections.has(3))) {
      key = "inside";
    } else if (!isNarrow && visibleSections.has(1)) key = "build";

    const pos = isNarrow
      ? resolveMobilePortraitPos(MOBILE_BLUEPRINTS[key], viewportHeight)
      : resolveKeyboardPos(BLUEPRINTS[key], layoutWidth);

    xBase.set(pos.x);
    yBase.set(pos.y);
    rxBase.set(pos.rx);
    ryBase.set(pos.ry);
    rzBase.set(pos.rz);
  }, [
    visibleSections,
    entered,
    layoutWidth,
    viewportHeight,
    isNarrow,
    xBase,
    yBase,
    rxBase,
    ryBase,
    rzBase,
  ]);

  return {
    prefersReducedMotion,
    handleShopKeyboards,
    handleExploreBuilds,
    x,
    y,
    rx,
    ry,
    rz,
    floatY,
    activeColorway,
    applyColorway,
    selectedTextureId,
    applyTexture,
    visibleSections,
    registerSection,
    entered,
    isNarrow,
    isKeyboardInteractive,
    isHeroKeyboardInView,
  };
}
