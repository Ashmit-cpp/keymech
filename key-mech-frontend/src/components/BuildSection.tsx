import type { RefCallback } from "react";
import { motion } from "motion/react";
import { KeyboardAsideSection } from "./keyboard-aside-section";

interface BuildSectionProps {
  sectionRef?: RefCallback<HTMLDivElement>;
  dataSection?: number;
}

const rightFeatures = [
  "User-defined key bindings",
  "Optimized gaming mode",
  "Dynamic RGB engine",
  "20 onboard profiles",
  "USB-C connectivity",

];

const leftFeatures = [
  "8 programmable macro keys",
  "Expanded customization options",
  "Personalized lighting effects",
  "Real-time battery monitoring",
  "Anti-ghosting technology",

];

export default function BuildSection({
  sectionRef,
  dataSection,
}: BuildSectionProps) {
  return (
    <div className="relative z-20 w-full origin-center">
      <KeyboardAsideSection align="left">
        <div className="relative z-10 flex h-full w-full flex-col items-start justify-center text-left text-foreground">
          <div className="mb-6 flex gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 w-5 -skew-x-32 bg-primary" />
            ))}
          </div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            [Why Specter 75]
          </p>

          <h2 className="mb-14 max-w-[520px] font-serif text-[2.6rem] font-bold uppercase leading-[0.9] tracking-[-0.035em] text-foreground md:text-[4.25rem]">
            Built for focus.
            <span className="block text-primary">Designed to </span>
            <span>endure</span>
            <span className="text-primary">.</span>
          </h2>

          <div className="grid w-full max-w-[360px] grid-cols-1 gap-x-2 gap-y-10 md:grid-cols-2">
            <div className="flex w-full min-w-0 flex-col">
              {leftFeatures.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex h-[52px] items-center border-b border-border"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-foreground/75">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            <div
              className="flex w-full min-w-0 flex-col"
              ref={sectionRef}
              data-section={dataSection}
            >
              {rightFeatures.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{
                    delay: i * 0.05 + 0.2,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex h-[52px] items-center border-b border-border"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-foreground/75">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </KeyboardAsideSection>
    </div>
  );
}
