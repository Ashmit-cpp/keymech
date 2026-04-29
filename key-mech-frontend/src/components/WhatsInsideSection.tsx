import type { RefCallback } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { KeyboardAsideSection } from "@/components/keyboard-aside-section";
import { Button } from "@/components/ui/button";
import { KEYCAP_TEXTURES } from "@/lib/constants";

type KeycapTexture = (typeof KEYCAP_TEXTURES)[number];

interface WhatsInsideSectionProps {
  sectionRef?: RefCallback<HTMLDivElement>;
  dataSection?: number;
  selectedTextureId?: KeycapTexture["id"];
  applyTexture?: (texture: KeycapTexture) => void;
}

export default function WhatsInsideSection({
  sectionRef,
  dataSection,
  selectedTextureId,
  applyTexture,
}: WhatsInsideSectionProps) {
  return (
    <div>
      <KeyboardAsideSection align="left">
        <div className="relative z-10 flex flex-col items-start text-left w-full h-full justify-center">
          <div className="relative w-full max-w-[420px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Keyboard colorway"
              ref={sectionRef} data-section={dataSection}
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

            {/* Texture pack picker */}
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
                Keycap Color
              </span>
              <div
                className="relative z-10 flex gap-3 items-center"
                role="group"
              >
                {KEYCAP_TEXTURES.map((texture) => {
                  const isActive = selectedTextureId === texture.id;
                  return (
                    <button
                      key={texture.id}
                      type="button"
                      title={texture.name}
                      aria-label={`${texture.name} keycap color`}
                      aria-pressed={isActive}
                      disabled={!applyTexture}
                      onClick={() => applyTexture?.(texture)}
                      className={`relative z-10 h-10 w-10 shrink-0 cursor-pointer rounded-sm p-[2px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 ${
                        isActive
                          ? "scale-110 border-2 border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border border-border hover:border-foreground/40"
                      }`}
                    >
                      <span
                        className="block size-full rounded-[2px] bg-cover bg-center"
                        style={{
                          backgroundColor: texture.knobColor,
                          backgroundImage: `url(${texture.path})`,
                        }}
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
