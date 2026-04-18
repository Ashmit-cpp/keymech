import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type RefObject,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSpring, useMotionValue, useReducedMotion } from "motion/react";
import { COLORWAYS } from "@/lib/constants";

interface KeyboardPos {
  x: number;
  y: number;
  scale: number;
  rx: number;
  ry: number;
  rz: number;
}

/** Targets at design width `DESIGN_WIDTH` (x as px offset; y in px). */
interface KeyboardBlueprint {
  xRef: number;
  y: number;
  scale: number;
  rx: number;
  ry: number;
  rz: number;
}

const BLUEPRINTS: Record<string, KeyboardBlueprint> = {
  hero: { xRef: 0, y: 15, scale: 1.1, rx: 22, ry: 0, rz: 0 },
  build: { xRef: 500, y: 10, scale: 1, rx: 0, ry: 0, rz: 0 },
  inside: { xRef: 400, y: 0, scale: 1.15, rx: 45, ry: 20, rz: -30 },
  groupbuy: { xRef: 300, y: 20, scale: 0.72, rx: 28, ry: -18, rz: -6 },
};

interface MobilePortraitBlueprint {
  yVh: number;
  scale: number;
  rx: number;
  ry: number;
  rz: number;
}

const MOBILE_BLUEPRINTS: Record<string, MobilePortraitBlueprint> = {
  // Keyboard pushed slightly below center so the headline clears above it
  hero: {
    yVh: 0.07,
    scale: 0.52,
    rx: 22,
    ry: 0,
    rz: 0,
  },
  build: {
    yVh: 0.05,
    scale: 0.56,
    rx: 4,
    ry: 0,
    rz: 0,
  },
  // Keyboard pushed into top zone so product copy sits below it
  inside: {
    yVh: -0.22,
    scale: 0.48,
    rx: 40,
    ry: 16,
    rz: -12,
  },
  groupbuy: {
    yVh: 0.08,
    scale: 0.4,
    rx: 24,
    ry: 0,
    rz: -8,
  },
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

  const scaleFromLayout = Math.pow(widthRatio, 0.48);
  const scale = clamp(b.scale * scaleFromLayout, 0.56, 1.22);

  return {
    x,
    y: b.y,
    scale,
    rx: b.rx,
    ry: b.ry,
    rz: b.rz,
  };
}

function resolveMobilePortraitPos(
  b: MobilePortraitBlueprint,
  layoutWidth: number,
  viewportHeight: number,
): KeyboardPos {
  const yPx = b.yVh * viewportHeight;
  const widthTweak = clamp(layoutWidth / 420, 0.58, 0.95);
  const scale = clamp(b.scale * widthTweak * 0.8, 0.28, 0.62);
  return {
    x: 0,
    y: yPx,
    scale,
    rx: b.rx,
    ry: b.ry,
    rz: b.rz,
  };
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
  const scBase = useMotionValue(0.7);
  const rxBase = useMotionValue(20);
  const ryBase = useMotionValue(0);
  const rzBase = useMotionValue(0);

  const mobileSpring = isNarrow ? SPRING_MOBILE : SPRING;

  const x = useSpring(xBase, mobileSpring);
  const y = useSpring(yBase, mobileSpring);
  const sc = useSpring(scBase, mobileSpring);
  const rx = useSpring(rxBase, mobileSpring);
  const ry = useSpring(ryBase, mobileSpring);
  const rz = useSpring(rzBase, mobileSpring);

  const [activeColorway, setActiveColorway] = useState<(typeof COLORWAYS)[0]>(
    COLORWAYS[0],
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
  const ioMarginY = isNarrow
    ? "-32% 0px -32% 0px"
    : viewportHeight < SHORT_VIEWPORT
      ? "-10% 0px -10% 0px"
      : "-15% 0px -15% 0px";

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
    if (!isNarrow && visibleSections.has(3)) key = "groupbuy";
    else if (visibleSections.has(2)) key = "inside";
    else if (!isNarrow && visibleSections.has(1)) key = "build";

    const pos = isNarrow
      ? resolveMobilePortraitPos(
          MOBILE_BLUEPRINTS[key],
          layoutWidth,
          viewportHeight,
        )
      : resolveKeyboardPos(BLUEPRINTS[key], layoutWidth);

    xBase.set(pos.x);
    yBase.set(pos.y);
    scBase.set(pos.scale);
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
    scBase,
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
    sc,
    rx,
    ry,
    rz,
    floatY,
    activeColorway,
    applyColorway,
    visibleSections,
    registerSection,
    entered,
    isNarrow,
    isKeyboardInteractive,
  };
}
