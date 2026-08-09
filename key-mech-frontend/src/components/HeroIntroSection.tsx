import type { RefCallback } from "react";
import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface HeroIntroSectionProps {
  sectionRef?: RefCallback<HTMLElement>;
  dataSection?: number;
  onShopKeyboards?: () => void;
  isProductLoading?: boolean;
}

export default function HeroIntroSection({
  sectionRef,
  dataSection,
  onShopKeyboards,
  isProductLoading = false,
}: HeroIntroSectionProps) {
  return (
    <section
      ref={sectionRef}
      data-section={dataSection}
      className="relative z-20 flex min-h-[calc(100vh-80px)] flex-col overflow-hidden"
    >
      <motion.div
        variants={copyContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-none flex-col items-center gap-3 px-6 pb-4 pt-10 text-center md:pt-14"
      >
        <motion.div variants={copyItem} className="flex gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-3 w-5 -skew-x-32 bg-primary" />
          ))}
        </motion.div>

        <motion.h1
          variants={copyItem}
          className="font-serif uppercase leading-[0.86] tracking-[-0.035em] text-foreground"
          style={{
            fontSize: "clamp(2rem, 8vw, 5.7rem)",
            fontWeight: 700,
          }}
        >
          <span className="block scale-x-[0.9] origin-left">
            <span className="inline sm:inline">Specter 75</span>
            <span className="px-2 sm:px-4 text-primary">Built</span>
            <span className="inline sm:inline">to Last</span>
            <span className="text-primary">.</span>
          </span>
        </motion.h1>

        <motion.div
          variants={copyItem}
          className="h-px w-10 bg-foreground/40"
        />

        <motion.p
          variants={copyItem}
          className="font-sans font-medium text-muted-foreground"
        >
          The long-term gaming board. Tuned, textured, and ready.
        </motion.p>

        <motion.div variants={copyItem} className="hidden md:flex">
          <Button
            size="lg"
            variant="landing"
            className="group flex items-center gap-3"
            onClick={onShopKeyboards}
            disabled={isProductLoading || !onShopKeyboards}
          >
            {isProductLoading ? "Loading Specter 75…" : "Shop Specter 75"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 z-10 hidden md:flex items-center justify-between px-6 pb-10 md:px-10 lg:px-12 ">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-semibold tracking-widest text-foreground/80">
          <span>[SPECTER]</span>
          <span className="hidden font-light text-foreground/20 sm:inline">
            |
          </span>
          <span>[75%]</span>
          <span className="hidden font-light text-foreground/20 sm:inline">
            |
          </span>
          <span>[READY]</span>
        </div>

        <div className="hidden gap-2 sm:flex" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-3 w-5 -skew-x-32 bg-foreground" />
          ))}
        </div>
      </div>
    </section>
  );
}
