import React, { useCallback, useEffect, useRef, useState } from "react";
import Hero from "@/components/Hero";
import Landing from "@/components/Landing";
import ProductSection from "@/components/ProductSection";
import { Spinner } from "@/components/ui/spinner";

const HomePage: React.FC = () => {
  const gatedContentRef = useRef<HTMLDivElement>(null);
  const shouldContinueScrollingRef = useRef(false);
  const keyboardReadyRef = useRef(false);
  const [isKeyboardReady, setIsKeyboardReady] = useState(false);
  const [isWaitingForKeyboard, setIsWaitingForKeyboard] = useState(false);

  const handleKeyboardReady = useCallback(() => {
    keyboardReadyRef.current = true;
    setIsKeyboardReady(true);
    setIsWaitingForKeyboard(false);
  }, []);

  useEffect(() => {
    if (isKeyboardReady) return;

    let touchY: number | null = null;

    const getScrollLimit = () => {
      const gatedContent = gatedContentRef.current;
      if (!gatedContent) return 0;

      const contentTop = gatedContent.getBoundingClientRect().top + window.scrollY;
      return Math.max(0, contentTop - window.innerHeight);
    };

    const stopAtKeyboard = () => {
      if (keyboardReadyRef.current) return;

      const limit = getScrollLimit();
      shouldContinueScrollingRef.current = true;
      setIsWaitingForKeyboard(true);
      if (window.scrollY !== limit) window.scrollTo({ top: limit });
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) return;

      const limit = getScrollLimit();
      if (window.scrollY >= limit - 1) {
        event.preventDefault();
        stopAtKeyboard();
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const nextY = event.touches[0]?.clientY;
      if (touchY === null || nextY === undefined) return;

      const scrollingDown = touchY - nextY > 0;
      touchY = nextY;
      if (!scrollingDown || window.scrollY < getScrollLimit() - 1) return;

      event.preventDefault();
      stopAtKeyboard();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const scrollKeys = ["ArrowDown", "PageDown", "End", " "];
      if (!scrollKeys.includes(event.key)) return;
      if (window.scrollY < getScrollLimit() - 1) return;

      event.preventDefault();
      stopAtKeyboard();
    };

    const onScroll = () => {
      if (keyboardReadyRef.current) return;
      if (window.scrollY > getScrollLimit() + 1) stopAtKeyboard();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    onScroll();

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isKeyboardReady]);

  useEffect(() => {
    if (!isKeyboardReady || !shouldContinueScrollingRef.current) return;

    shouldContinueScrollingRef.current = false;
    const frame = requestAnimationFrame(() => {
      const gatedContent = gatedContentRef.current;
      if (!gatedContent) return;

      const contentTop =
        gatedContent.getBoundingClientRect().top + window.scrollY;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      window.scrollTo({
        top: contentTop,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [isKeyboardReady]);

  return (
    <div className="min-h-screen text-foreground font-sans px-2 md:px-12 lg:px-16">
      <main className="relative isolate overflow-x-clip bg-background">
        <Landing isScrollBlocked={isWaitingForKeyboard} />

        <div
          ref={gatedContentRef}
          aria-hidden={!isKeyboardReady}
          inert={!isKeyboardReady}
          className={
            isKeyboardReady
              ? "opacity-100"
              : "pointer-events-none select-none opacity-0"
          }
        >
          <Hero onKeyboardReady={handleKeyboardReady} />
          <ProductSection
            title="New Arrivals"
            subtitle="The latest gear fresh from the factory."
          />
        </div>

        {isWaitingForKeyboard && !isKeyboardReady && (
          <div
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border border-border bg-background/95 px-5 py-3 shadow-md backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <Spinner className="size-5 shrink-0 text-primary" />
            <span className="whitespace-nowrap text-sm font-medium text-foreground">
              Preparing your keyboard…
            </span>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
