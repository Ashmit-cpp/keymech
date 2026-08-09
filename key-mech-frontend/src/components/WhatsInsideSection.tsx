import type { RefCallback } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Wrench } from "lucide-react";
import { KeyboardAsideSection } from "@/components/keyboard-aside-section";
import { Button } from "@/components/ui/button";
import { KEYCAP_TEXTURES } from "@/lib/constants";

type KeycapTexture = (typeof KEYCAP_TEXTURES)[number];

interface WhatsInsideSectionProps {
  sectionRef?: RefCallback<HTMLDivElement>;
  dataSection?: number;
  selectedTextureId?: KeycapTexture["id"];
  applyTexture?: (texture: KeycapTexture) => void;
  onAddToCart?: () => void | Promise<unknown>;
  onBuyNow?: () => void | Promise<unknown>;
  onCustomizeInGarage?: () => void;
  isCommercePending?: boolean;
  isProductLoading?: boolean;
  hasProductError?: boolean;
}

export default function WhatsInsideSection({
  sectionRef,
  dataSection,
  selectedTextureId,
  applyTexture,
  onAddToCart,
  onBuyNow,
  onCustomizeInGarage,
  isCommercePending = false,
  isProductLoading = false,
  hasProductError = false,
}: WhatsInsideSectionProps) {
  return (
    <div>
      <KeyboardAsideSection align="left">
        <div className="relative z-10 flex h-full w-full flex-col items-start justify-center text-left">
          <div className="relative w-full max-w-[420px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Keyboard colorway"
              ref={sectionRef} data-section={dataSection}
            >
              <div className="mb-6 flex gap-2" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-3 w-5 -skew-x-32 bg-primary" />
                ))}
              </div>

              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                [KeyMech Series]
              </p>

              <h2 className="mt-2 font-serif text-[3rem] font-bold uppercase leading-[0.88] tracking-[-0.035em] text-foreground md:text-[4.7rem]">
                KeyMech
                <span className="block text-primary">Specter 75</span>
              </h2>

              <div className="mt-6 h-px w-10 bg-foreground/40" />

              <p className="mt-6 max-w-[340px] font-sans font-medium leading-relaxed text-muted-foreground">
                Specter 75 is built as a long-term gaming keyboard, not a
                disposable setup upgrade.
              </p>

              <div className="mt-8 font-serif text-5xl font-bold leading-none tracking-[-0.03em] text-foreground">
                ₹16,999
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
              <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                [Keycap Color]
              </span>
              <div
                className="relative z-10 flex items-center gap-3"
                role="group"
              >
                {KEYCAP_TEXTURES.map((texture) => {
                  const isActive = selectedTextureId === texture.id;
                  return (
                    <Button
                      key={texture.id}
                      type="button"
                      variant="outline"
                      size="icon-lg"
                      title={texture.name}
                      aria-label={`${texture.name} keycap color`}
                      aria-pressed={isActive}
                      disabled={!applyTexture}
                      onClick={() => applyTexture?.(texture)}
                      className={`relative z-10 h-10 w-10 shrink-0 rounded-none p-[2px] ${
                        isActive
                          ? "scale-110 border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "border-border hover:border-foreground/40"
                      }`}
                    >
                      <span
                        className="block size-full rounded-[2px] bg-cover bg-center"
                        style={{
                          backgroundColor: texture.knobColor,
                          backgroundImage: `url(${texture.path})`,
                        }}
                      />
                    </Button>
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
              className="mt-10 flex w-full max-w-[360px] flex-col gap-3"
            >
              <Button
                size="lg"
                variant="landing"
                className="group w-full"
                onClick={onAddToCart}
                disabled={isCommercePending || isProductLoading || hasProductError}
              >
                <span>{isCommercePending ? "Adding…" : "Add to Cart"}</span>
                <ArrowUpRight className="ml-4 h-[14px] w-[14px] opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group w-full"
                onClick={onBuyNow}
                disabled={isCommercePending || isProductLoading || hasProductError}
              >
                <span>Buy Now</span>
                <ArrowUpRight className="ml-4 h-[14px] w-[14px] opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group w-full"
                onClick={onCustomizeInGarage}
                disabled={isProductLoading || hasProductError}
              >
                <span>Customize in Garage</span>
                <Wrench className="ml-4 h-[14px] w-[14px] opacity-70 transition-transform group-hover:rotate-12" />
              </Button>
              {hasProductError && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  Specter 75 is temporarily unavailable. Please try again later.
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </KeyboardAsideSection>
    </div>
  );
}
