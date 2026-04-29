import { useRef } from "react";
import { motion } from "motion/react";
import { useHero } from "@/hooks/use-hero";
import BuildSection from "./BuildSection";
import GroupBuySection from "./GroupBuySection";
import GltfKeyboardViewer from "./gltf-keyboard-viewer";
import HeroIntroSection from "./HeroIntroSection";
import WhatsInsideSection from "./WhatsInsideSection";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    x,
    y,
    rx,
    ry,
    rz,
    floatY,
    registerSection,
    entered,
    activeColorway,
    selectedTextureId,
    applyTexture,
    isNarrow,
    isKeyboardInteractive,
    isHeroKeyboardInView,
  } = useHero(containerRef);

  return (
    <div
      ref={containerRef}
      className="hero relative min-h-screen overflow-x-clip bg-background text-foreground"
    >
      <div className="relative w-full">
        {/* ── Sticky 3D keyboard scene ──────────────────────────────────────── */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div
            className="pointer-events-none sticky top-0 flex h-screen w-full items-center justify-center overflow-x-clip"
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
                style={{ x, y }}
              >
                <motion.div
                  className="pointer-events-none"
                  style={{ y: floatY }}
                >
                  <div className="pointer-events-auto flex w-full max-w-full justify-center">
                    <GltfKeyboardViewer
                      baseRotateX={rx}
                      baseRotateY={ry}
                      baseRotateZ={rz}
                      isInteractive={isKeyboardInteractive}
                      isHeroKeyboardInView={isHeroKeyboardInView}
                      activeColorway={activeColorway}
                      selectedTextureId={selectedTextureId}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="relative z-20">
          <HeroIntroSection
            sectionRef={(el) => registerSection(el, 0)}
            dataSection={0}
          />

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
              selectedTextureId={selectedTextureId}
              applyTexture={applyTexture}
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
