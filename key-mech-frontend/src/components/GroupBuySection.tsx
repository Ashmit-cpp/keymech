import type { RefCallback } from "react";
import { motion } from "motion/react";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyboardAsideSection } from "./keyboard-aside-section";

const SLOTS_RESERVED = 682;
const SLOTS_TOTAL = 1000;
const DAYS_LEFT = 14;

const progress = (SLOTS_RESERVED / SLOTS_TOTAL) * 100;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface GroupBuySectionProps {
  sectionRef?: RefCallback<HTMLDivElement>;
  dataSection?: number;
}

export default function GroupBuySection({
  sectionRef,
  dataSection,
}: GroupBuySectionProps) {
  return (
    <div ref={sectionRef} data-section={dataSection}>
      <KeyboardAsideSection>
        <div className="relative z-10 text-foreground">

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
          >
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium mb-5"
            >
              <Clock className="h-3 w-3 text-primary" />
              <span className="tracking-widest uppercase">Group Buy</span>
            </Badge>

            <h2 className="mb-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Join the{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/80">
                Run
              </span>
            </h2>

            <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Limited production run. Reserve your board before the window closes.
              Expected delivery Q3 2026.
            </p>
          </motion.div>

          {/* Progress card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.1, duration: 0.55, ease: EASE_OUT }}
            className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Pre-order window
              </span>
              <span className="text-sm font-bold text-primary">
                {DAYS_LEFT} days left
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.15 }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {SLOTS_RESERVED.toLocaleString()} /{" "}
                {SLOTS_TOTAL.toLocaleString()} units secured
              </span>
              <span className="text-sm font-bold text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.2, duration: 0.55, ease: EASE_OUT }}
            className="mt-6 flex flex-wrap gap-4"
          >
            <Button size="lg" className="group rounded-full px-8">
              Secure Yours
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-6"
            >
              Details
            </Button>
          </motion.div>

        </div>
      </KeyboardAsideSection>
    </div>
  );
}
