import type { ReactNode } from "react";
import { motion } from "motion/react";

interface KeyboardAsideSectionProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}

/**
 * Content on one side, empty column reserved for the fixed 3D keyboard
 * defaults to left align.
 */
export function KeyboardAsideSection({
  children,
  className = "",
  align = "left"
}: KeyboardAsideSectionProps) {
  return (
    <section className={className}>
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        viewport={{ margin: "50% 0px 50% 0px", once: false }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`mx-auto flex w-full max-w-7xl min-h-[90vh] flex-col p-10 md:flex-row ${
          align === "left" ? "md:flex-row" : "md:flex-row-reverse"
        }`}
      >
        <div className="flex min-w-0 flex-1 flex-col justify-start gap-8 pt-[50vh] md:justify-center md:pt-0">
          {children}
        </div>
        <div
          className="hidden shrink-0 md:block md:w-[50%] md:min-w-[400px] md:max-w-3xl"
          aria-hidden
        />
      </motion.div>
    </section>
  );
}
