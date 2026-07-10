import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";

const copyContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
};

const copyItem = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleShopKeyboards = () => {
    navigate("/category/keyboards");
  };

  const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const imgTransition = {
    duration: prefersReducedMotion ? 0.2 : 0.85,
    ease: easeOut,
  };

  return (
    <section className="relative min-h-svh overflow-hidden bg-background">
      <div className="relative z-10 flex min-h-svh w-full flex-col gap-6 px-6 pb-28 pt-24 md:min-h-[calc(100vh-80px)] md:flex-row md:items-center md:gap-0 md:px-0 md:pb-0 md:pt-0 md:pl-8 lg:pl-12">
        {/* Left copy */}
        <div className="relative z-20 flex w-full shrink-0 flex-col gap-5 sm:gap-6 md:w-[45%] lg:w-[50%]">
          {/* Red accent slashes */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 w-5 -skew-x-32 bg-primary" />
            ))}
          </div>

          <motion.h1
            className="uppercase leading-[0.86] tracking-[-0.035em] text-foreground font-serif"
            style={{
              fontSize: "clamp(3rem, 6vw, 6.5rem)",
              fontWeight: 700,
            }}
            variants={copyContainer}
            initial="hidden"
            animate="show"
          >
            <motion.span
              variants={copyItem}
              className="block origin-left scale-x-[0.9]"
            >
              Built for
            </motion.span>

            <motion.span
              variants={copyItem}
              className="block origin-left scale-x-[0.9]"
            >
              Focus.
            </motion.span>

            <motion.span
              variants={copyItem}
              className="block origin-left scale-x-[0.9] text-primary"
            >
              Designed
            </motion.span>

            <motion.span
              variants={copyItem}
              className="block origin-left scale-x-[0.9] whitespace-nowrap"
            >
              to Stand Out<span className="text-primary">.</span>
            </motion.span>
          </motion.h1>

          <div className="h-px w-10 bg-foreground/40" />

          <motion.p
            variants={copyItem}
            initial="hidden"
            animate="show"
            className="max-w-xs font-sans font-medium text-muted-foreground"
          >
            Performance meets precision.
            <br />
            Every keystroke, elevated.
          </motion.p>

          <motion.div variants={copyItem} initial="hidden" animate="show">
            <Button
              size="xxl"
              variant="landing"
              className="group flex items-center gap-3 rounded-none"
              onClick={handleShopKeyboards}
            >
              Explore Keyboards
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>

        {/* Right image */}
        <div className="relative -mx-6 flex min-h-[280px] flex-1 self-stretch overflow-hidden sm:min-h-[340px] md:mx-0 md:ml-auto">
          {!isImageLoaded && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
              aria-hidden
            >
              <motion.div
                className="h-1.5 w-24 rounded-full bg-primary/25"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: [0.35, 0.85, 0.35] }
                }
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Loading preview
              </span>
            </div>
          )}

          <div className="relative ml-auto h-[12svh] min-h-[280px] w-full flex-1 overflow-hidden bg-background sm:h-[46svh] sm:min-h-[340px] md:h-screen">
            <motion.img
              src="/landing.webp"
              alt="Premium Keyboard Build"
              decoding="async"
              fetchPriority="high"
              loading="eager"
              onLoad={() => setIsImageLoaded(true)}
              className="absolute inset-0 h-full w-full object-contain object-center"
              initial={{
                opacity: 0,
                scale: prefersReducedMotion ? 1 : 1.04,
                filter: prefersReducedMotion ? "blur(0px)" : "blur(12px)",
              }}
              animate={
                isImageLoaded
                  ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                  : undefined
              }
              transition={imgTransition}
            />

            {/* Blend image into left content */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[18%] bg-linear-to-b from-background via-background/50 to-transparent md:inset-x-auto md:inset-y-0 md:left-0 md:h-auto md:w-[13%] md:bg-linear-to-r" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between gap-6 px-6 pb-7 sm:items-center sm:pb-8 md:px-8 md:pb-10 lg:px-12">
        {/* Left side tags */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.68rem] font-semibold tracking-widest text-foreground/80 sm:gap-x-8 sm:text-xs">
          <span>[PRECISION]</span>
          <span className="text-foreground/20 font-light">|</span>
          <span>[DESIGN]</span>
          <span className="hidden text-foreground/20 font-light sm:inline">
            |
          </span>
          <span>[PERFORMANCE]</span>
        </div>

        {/* Right side pagination & dashes */}
        <div className="hidden items-center gap-12 sm:flex">
          {/* Black slashes */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 w-5 -skew-x-32 bg-foreground" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
