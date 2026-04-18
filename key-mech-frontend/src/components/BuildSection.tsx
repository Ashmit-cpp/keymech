import type { RefCallback } from "react";
import { motion } from "motion/react";
import { KeyboardAsideSection } from "./keyboard-aside-section";

interface BuildSectionProps {
  sectionRef?: RefCallback<HTMLDivElement>;
  dataSection?: number;
}

const leftFeatures = [
  "8 programmable macro keys",
  "Optimized gaming mode",
  "Advanced anti-ghosting technology",
  "Dynamic RGB engine",
  "20 onboard profiles",
];

const rightFeatures = [
  "USB-C connectivity",
  "Expanded customization options",
  "Personalized lighting effects",
  "User-defined key bindings",
  "Real-time battery monitoring",
];

export default function BuildSection({
  sectionRef,
  dataSection,
}: BuildSectionProps) {
  return (
    <div className="relative z-20 w-full origin-center scale-90 md:scale-100">
      <KeyboardAsideSection align="left">
        <div className="relative z-10 flex h-full w-full flex-col items-start justify-center pl-10 text-left text-foreground -translate-y-8">
          <p className="mb-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Why Specter 75
          </p>

          <h2 className="mb-16 max-w-[520px] text-2xl font-bold leading-tight tracking-tight text-foreground md:text-[2.5rem]">
            Engineered with premium features to deliver exceptional keyboard
            performance.
          </h2>

          <div className="grid w-full max-w-[560px] grid-cols-1 gap-x-14 gap-y-10 md:grid-cols-2">
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
                  <span className="text-xs font-medium tracking-wide text-muted-foreground">
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
                  <span className="text-xs font-medium tracking-wide text-muted-foreground">
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
