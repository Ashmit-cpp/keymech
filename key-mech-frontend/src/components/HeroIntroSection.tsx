import type { RefCallback } from "react";
import { motion, type Variants } from "motion/react";
import { Badge } from "@/components/ui/badge";

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
}

export default function HeroIntroSection({
  sectionRef,
  dataSection,
}: HeroIntroSectionProps) {
  return (
    <section
      ref={sectionRef}
      data-section={dataSection}
      className="relative z-20 flex min-h-0 flex-col"
    >
      <motion.div
        variants={copyContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-start px-6 pb-6 pt-2 md:min-h-[60vh] md:justify-start md:px-10 md:pb-0 md:pt-0"
      >
        <motion.div
          variants={copyItem}
          className="flex shrink-0 flex-col items-center px-2 pb-2 pt-2 text-center md:pt-20"
        >
          <Badge
            variant="secondary"
            className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            New Specter 75 Series Available Now
          </Badge>
        </motion.div>

        <motion.h1
          variants={copyItem}
          className="shrink-0 px-2 pb-4 text-center text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:pb-6 md:text-6xl lg:text-7xl"
        >
          Performance
          <br />
          <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            That Lasts
          </span>
        </motion.h1>
      </motion.div>
    </section>
  );
}
