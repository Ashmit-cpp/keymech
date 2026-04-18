import type { RefCallback } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { KeyboardAsideSection } from "@/components/keyboard-aside-section";
import { Button } from "@/components/ui/button";
import { COLORWAYS } from "@/lib/constants";

type Colorway = (typeof COLORWAYS)[number];

/** Swatches map to full theme entries in `COLORWAYS` (3D keyboard + CSS vars). */
const INSIDE_COLOR_PICKER: {
  label: string;
  colorway: Colorway;
  swatch: string;
}[] = [
  { label: "Lime", colorway: COLORWAYS[0], swatch: COLORWAYS[0].info.accent },
  { label: "Crimson", colorway: COLORWAYS[1], swatch: COLORWAYS[1].info.accent },
  { label: "Stealth", colorway: COLORWAYS[2], swatch: COLORWAYS[2].info.accent },
  { label: "Stealth", colorway: COLORWAYS[3], swatch: COLORWAYS[3].info.accent },
  
];

interface WhatsInsideSectionProps {
  sectionRef?: RefCallback<HTMLDivElement>;
  dataSection?: number;
  activeColorway?: Colorway;
  applyColorway?: (cw: Colorway) => void;
}

export default function WhatsInsideSection({
  sectionRef,
  dataSection,
  activeColorway,
  applyColorway,
}: WhatsInsideSectionProps) {
  return (
    <div ref={sectionRef} data-section={dataSection}>
      <KeyboardAsideSection align="left">
        <div className="relative z-10 flex flex-col items-start text-left w-full h-full justify-center">
          <div className="relative w-full max-w-[420px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >

              <h2 className="mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                KeyMech{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/80">
                  Specter 75
                </span>
              </h2>

              <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground max-w-[340px]">
                Specter 75 is built as a long-term gaming keyboard, not a
                disposable setup upgrade.
              </p>

              <div className="mt-8 text-3xl font-bold tracking-tight text-foreground">
                $200
              </div>
            </motion.div>

            {/* Color picker */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                delay: 0.1,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-8"
            >
              <span className="text-[13px] font-medium tracking-widest text-muted-foreground uppercase mb-3 block">
                Color
              </span>
              <div
                className="relative z-10 flex gap-3 items-center"
                role="group"
                aria-label="Keyboard colorway"
              >
                {INSIDE_COLOR_PICKER.map(({ label, colorway, swatch }) => {
                  const isActive =
                    activeColorway != null && activeColorway === colorway;
                  return (
                    <button
                      key={label}
                      type="button"
                      title={colorway.name}
                      aria-label={`${colorway.name} colorway`}
                      aria-pressed={isActive}
                      disabled={!applyColorway}
                      onClick={() => applyColorway?.(colorway)}
                      className={`relative z-10 h-9 w-9 shrink-0 cursor-pointer rounded-sm p-[2px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 ${
                        isActive
                          ? "border-[1.5px] border-primary"
                          : "border border-border hover:border-foreground/40"
                      }`}
                    >
                      <span
                        className="block size-full rounded-[2px]"
                        style={{ background: swatch }}
                      />
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                delay: 0.2,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-10 flex flex-col gap-3 w-full max-w-[360px]"
            >
              <Button size="lg" className="w-full group">
                <span className="tracking-wide text-[14px]">Add to Cart</span>
                <ArrowUpRight className="ml-4 w-[14px] h-[14px] opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
              <Button size="lg" variant="secondary" className="w-full group">
                <span className="tracking-wide text-[14px]">Buy Now</span>
                <ArrowUpRight className="ml-4 w-[14px] h-[14px] opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </KeyboardAsideSection>
    </div>
  );
}
