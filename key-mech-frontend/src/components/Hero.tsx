import { useRef } from "react";
import { motion, type Variants } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { useHero } from "@/hooks/use-hero";
import BuildSection from "./BuildSection";
import GroupBuySection from "./GroupBuySection";
import Keyboard3D from "./keyboard-3d";
import WhatsInsideSection from "./WhatsInsideSection";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const copyContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
};

const copyItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: EASE_OUT },
  },
};

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    x,
    y,
    sc,
    rx,
    ry,
    rz,
    floatY,
    registerSection,
    entered,
    activeColorway,
    applyColorway,
    isNarrow,
    isKeyboardInteractive,
  } = useHero(containerRef);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-x-clip bg-background text-foreground"
    >
      <div className="relative w-full">
        {/* ── Sticky 3D keyboard scene ──────────────────────────────────────── */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div
            className="pointer-events-none sticky top-0 flex h-screen w-full items-center justify-center overflow-x-clip"
            style={{
              perspective: "min(1500px, 135vw)",
              contain: "layout style",
            }}
          >
            <motion.div
              className="pointer-events-none"
              initial={false}
              animate={{
                z: entered ? 0 : -800,
                y: entered ? 0 : "100vh",
                opacity: entered ? 1 : 0,
              }}
              transition={{
                opacity: { duration: 0.55, ease: "easeOut" },
                default: { duration: 0.88, ease: EASE_OUT },
              }}
            >
              <motion.div
                className="pointer-events-none"
                style={{ x, y, scale: sc }}
              >
                <motion.div
                  className="pointer-events-none"
                  style={{ y: floatY, rotateZ: rz }}
                >
                  <div className="pointer-events-auto inline-flex max-w-full filter drop-shadow-2xl shadow-black/80">
                    <Keyboard3D
                      baseRotateX={rx}
                      baseRotateY={ry}
                      baseRotateZ={rz}
                      isInteractive={isKeyboardInteractive}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="relative z-20">
          <section
            ref={(el) => registerSection(el, 0)}
            data-section={0}
            className="relative z-20 flex min-h-[78vh] flex-col mb-0 md:min-h-[60vh] md:mb-24"
          >
            <motion.div
              variants={copyContainer}
              initial="hidden"
              animate="show"
              className="relative z-10 mx-auto flex min-h-[78vh] w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 md:min-h-[60vh] md:justify-start md:px-10"
            >
              {/* Top: badge (direct child for stagger) */}
              <motion.div
                variants={copyItem}
                className="flex shrink-0 flex-col items-center px-2 pb-2 pt-4 text-center md:pt-20"
              >
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  New Specter 75 Series Available Now
                </Badge>
              </motion.div>

              {/* Top: headline — above keyboard */}
              <motion.h1
                variants={copyItem}
                className="shrink-0 px-2 pb-4 text-center text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:pb-6 md:text-6xl lg:text-7xl"
              >
                Performance
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/80">
                  That Lasts
                </span>
              </motion.h1>
            </motion.div>
          </section>

          {/* SECTION 1: Build — desktop only */}
          {!isNarrow && (
            <section className="relative flex-col justify-center">
              <BuildSection
                sectionRef={(el) => registerSection(el, 1)}
                dataSection={1}
              />
            </section>
          )}

          {/* SECTIONS 2 & 3: Details & Group Buy */}
          <div className="relative">
            <WhatsInsideSection
              sectionRef={(el) => registerSection(el, 2)}
              dataSection={2}
              activeColorway={activeColorway}
              applyColorway={applyColorway}
            />

            {/* Group Buy — desktop only */}
            {!isNarrow && (
              <GroupBuySection
                sectionRef={(el) => registerSection(el, 3)}
                dataSection={3}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
