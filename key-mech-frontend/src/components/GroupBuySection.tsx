"use client";

import type { RefCallback } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KeyboardAsideSection } from "./keyboard-aside-section";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface GroupBuySectionProps {
  sectionRef?: RefCallback<HTMLDivElement>;
  dataSection?: number;
  onAddToCart?: () => void | Promise<unknown>;
  onViewDetails?: () => void;
  isCommercePending?: boolean;
  isProductLoading?: boolean;
  hasProductError?: boolean;
}

export default function GroupBuySection({
  sectionRef,
  dataSection,
  onAddToCart,
  onViewDetails,
  isCommercePending = false,
  isProductLoading = false,
  hasProductError = false,
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
            <div className="mb-6 flex gap-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-3 w-5 -skew-x-32 bg-primary" />
              ))}
            </div>

            <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <PackageCheck className="h-3 w-3 text-primary" />
              [Available Now]
            </div>

            <h2 className="mb-6 max-w-[460px] font-serif text-[3rem] font-bold uppercase leading-[0.88] tracking-[-0.035em] text-foreground md:text-[4.7rem]">
              Built and
              <span className="block text-primary">Ready.</span>
            </h2>

            <div className="mb-6 h-px w-10 bg-foreground/40" />

            <p className="max-w-md font-sans font-medium leading-relaxed text-muted-foreground">
              Specter 75 is in stock and ready to become your daily board.
              Choose your colorway and make it yours.
            </p>
          </motion.div>

          {/* Progress card wrapped in motion */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.1, duration: 0.55, ease: EASE_OUT }}
            className="mt-8 max-w-[460px]"
          >
            <Card className="rounded-none border-border bg-background shadow-none">
              <CardContent className="space-y-4 p-6">
                {["In stock", "Three colorways", "Ships fully assembled"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
                        {item}
                      </span>
                    </div>
                  ),
                )}
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
              onClick={onAddToCart}
              disabled={isCommercePending || isProductLoading || hasProductError}
            >
              {isCommercePending ? "Adding…" : "Add to Cart"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className=""
              onClick={onViewDetails}
              disabled={isProductLoading || hasProductError}
            >
              Details
            </Button>
          </motion.div>
          {hasProductError && (
            <p className="mt-4 text-sm font-medium text-destructive" role="alert">
              Product availability could not be loaded.
            </p>
          )}

        </div>
      </KeyboardAsideSection>
    </div>
  );
}
