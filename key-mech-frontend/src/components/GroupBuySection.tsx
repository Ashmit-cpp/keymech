"use client";

import { useState, type RefCallback } from "react";
import { motion } from "motion/react";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card"; // <-- Imported Shadcn Card
import { KeyboardAsideSection } from "./keyboard-aside-section";

const SLOTS_RESERVED = 682;
const SLOTS_TOTAL = 1000;
const DAYS_LEFT = 14;

const targetProgress = (SLOTS_RESERVED / SLOTS_TOTAL) * 100;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface GroupBuySectionProps {
  sectionRef?: RefCallback<HTMLDivElement>;
  dataSection?: number;
}

export default function GroupBuySection({
  sectionRef,
  dataSection,
}: GroupBuySectionProps) {
  const [currentProgress, setCurrentProgress] = useState(0);

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
            <div className="mb-6 flex gap-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-3 w-5 -skew-x-32 bg-primary" />
              ))}
            </div>

            <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Clock className="h-3 w-3 text-primary" />
              [Group Buy]
            </div>

            <h2 className="mb-6 max-w-[460px] font-serif text-[3rem] font-bold uppercase leading-[0.88] tracking-[-0.035em] text-foreground md:text-[4.7rem]">
              Join the
              <span className="block text-primary">Run.</span>
            </h2>

            <div className="mb-6 h-px w-10 bg-foreground/40" />

            <p className="max-w-md font-sans font-medium leading-relaxed text-muted-foreground">
              Limited production run. Reserve your board before the window closes.
              Expected delivery Q3 2026.
            </p>
          </motion.div>

          {/* Progress card wrapped in motion */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            onViewportEnter={() => {
              setTimeout(() => setCurrentProgress(targetProgress), 150);
            }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.1, duration: 0.55, ease: EASE_OUT }}
            className="mt-8 max-w-[460px]"
          >
            <Card className="rounded-none border-border bg-background shadow-none">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Pre-order window
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {DAYS_LEFT} days left
                  </span>
                </div>

                {/* Shadcn Progress bar */}
                <Progress 
                  value={currentProgress} 
                  className="h-1.5 rounded-none bg-muted" 
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {SLOTS_RESERVED.toLocaleString()} /{" "}
                    {SLOTS_TOTAL.toLocaleString()} units secured
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                    {Math.round(targetProgress)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.2, duration: 0.55, ease: EASE_OUT }}
            className="mt-6 flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              variant="landing"
              className="group"
            >
              Secure Yours
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className=""
            >
              Details
            </Button>
          </motion.div>

        </div>
      </KeyboardAsideSection>
    </div>
  );
}