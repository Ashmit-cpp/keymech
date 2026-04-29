import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const copyContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
};

const copyItem = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleShopKeyboards = () => {
    navigate("/category/keyboards");
  };

  const handleExploreBuilds = () => {
    navigate("/products");
  };

  const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const orbLoopTransition = prefersReducedMotion
    ? undefined
    : {
        duration: 14,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut" as const,
      };

  return (
    <section className="relative overflow-hidden pt-12 md:pt-6">
     <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
  {/* base dark depth */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,hsl(var(--primary)/0.10),transparent_34%),radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.045),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_38%)]" />

  {/* subtle left grid like the mockup */}
  <div className="absolute left-0 top-0 h-full w-[42%] opacity-[0.11] [background-image:linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_right,black,transparent)]" />

  {/* page-level diffused corner orbs */}
  <div className="absolute bottom-[-8%] left-[-12%] h-[560px] w-[560px] rounded-full bg-primary/18 blur-[150px]" />
  <div className="absolute left-[-16%] top-[-18%] h-[520px] w-[520px] rounded-full bg-white/10 blur-[160px]" />

  {/* red product-side orb */}
  <motion.div
    className="absolute right-[6%] bottom-[2%] h-[520px] w-[520px] rounded-full bg-primary/25 blur-[120px]"
    animate={
      prefersReducedMotion
        ? undefined
        : {
            scale: [1, 1.08, 1],
            opacity: [0.18, 0.32, 0.18],
            x: [0, -18, 0],
          }
    }
    transition={orbLoopTransition ? { ...orbLoopTransition, duration: 13 } : undefined}
  />

  {/* smaller hot red floor glow */}
  <motion.div
    className="absolute right-[16%] bottom-[10%] h-[220px] w-[420px] rounded-full bg-primary/35 blur-[90px]"
    animate={
      prefersReducedMotion
        ? undefined
        : {
            opacity: [0.22, 0.42, 0.22],
            scaleX: [1, 1.14, 1],
          }
    }
    transition={orbLoopTransition ? { ...orbLoopTransition, duration: 10 } : undefined}
  />

  {/* cool white atmospheric orb behind image */}
  <motion.div
    className="absolute right-[28%] top-[12%] h-[360px] w-[360px] rounded-full bg-white/10 blur-[130px]"
    animate={
      prefersReducedMotion
        ? undefined
        : {
            y: [0, -18, 0],
            opacity: [0.08, 0.16, 0.08],
          }
    }
    transition={orbLoopTransition ? { ...orbLoopTransition, duration: 15 } : undefined}
  />

  {/* left-side faint ambient red */}
  <motion.div
    className="absolute left-[-12%] top-[18%] h-[480px] w-[480px] rounded-full bg-primary/10 blur-[140px]"
    animate={
      prefersReducedMotion
        ? undefined
        : {
            scale: [1, 1.06, 1],
            opacity: [0.08, 0.16, 0.08],
          }
    }
    transition={orbLoopTransition ? { ...orbLoopTransition, duration: 17 } : undefined}
  />

  {/* vignette */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.48)_100%)]" />
</div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-56 bg-gradient-to-b from-transparent via-background/80 to-background" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1720px] flex-col gap-8 px-6 py-10 sm:px-8 md:flex-row md:items-center md:gap-6 lg:px-10 xl:gap-8">
        <div className="flex flex-1 items-center">
          <motion.div
            className="w-full max-w-[720px] space-y-8 text-center md:text-left"
            variants={copyContainer}
            initial="hidden"
            animate="show"
          >
            <motion.h1
              variants={copyItem}
              className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
            >
              Craft Your Perfect <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/80">
                Typing Experience
              </span>
            </motion.h1>

            <motion.p
              variants={copyItem}
              className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed"
            >
              Premium mechanical keyboards, custom components, and artisan keycaps for enthusiasts who
              demand precision and aesthetics.
            </motion.p>

            <motion.div
              variants={copyItem}
              className="flex flex-row items-center gap-4 justify-center md:justify-start"
            >
              <Button size="lg" className="min-w-[160px] group" onClick={handleShopKeyboards}>
                Shop Keyboards
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="secondary" className="min-w-[160px]" onClick={handleExploreBuilds}>
                Explore Builds
              </Button>
            </motion.div>

            <motion.div
              variants={copyItem}
              className="hidden md:flex items-center justify-center md:justify-start gap-8 pt-4"
            >
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">2k+</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Happy Customers</span>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">100%</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Quality Guarantee</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative min-h-[50vh] w-full perspective-1000 md:min-h-[78vh] md:flex-1">
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl md:inset-y-4 md:left-0 md:right-0 md:rounded-3xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className={cn(
                "absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-700 ease-out",
                isImageLoaded ? "opacity-0 pointer-events-none" : "opacity-100",
              )}
              aria-hidden
            >
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-primary/12 to-transparent skew-x-[-18deg] w-[55%]"
                  initial={{ x: "-120%" }}
                  animate={{ x: "220%" }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-3 px-6">
                <motion.div
                  className="h-1.5 w-24 rounded-full bg-primary/25"
                  animate={prefersReducedMotion ? undefined : { opacity: [0.35, 0.85, 0.35] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                  Loading preview
                </span>
              </div>
            </div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center overflow-visible"
              initial={false}
              animate={
                isImageLoaded
                  ? { rotateX: 0, rotateY: 8, rotateZ: 0, scale: 1.18, y: 0 }
                  : { rotateX: 0, rotateY: 22, rotateZ: 0, scale: 1, y: 0 }
              }
              transition={
                isImageLoaded
                  ? {
                      rotateX: { duration: 1, ease: easeOut },
                      rotateY: { duration: 1, ease: easeOut },
                      rotateZ: { duration: 1, ease: easeOut },
                      scale: { duration: 1, ease: easeOut },
                      y: { duration: 1, ease: easeOut },
                    }
                  : { duration: 0.6, ease: easeOut }
              }
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative flex w-[155%] max-w-none flex-col items-center md:w-[170%]">
                <motion.img
                  src="/landing.png"
                  alt="Premium Keyboard Build"
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                  onLoad={() => setIsImageLoaded(true)}
                  className="max-h-[62vh] w-full object-contain object-center blend-multiply md:max-h-[92vh] [mask-image:radial-gradient(ellipse_at_center,black_54%,rgba(0,0,0,0.88)_70%,transparent_100%)]"
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0, scale: 1, filter: "blur(0px)" }
                      : { opacity: 0, scale: 1.06, filter: "blur(14px)" }
                  }
                  animate={
                    isImageLoaded
                      ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                      : prefersReducedMotion
                        ? { opacity: 0, scale: 1, filter: "blur(0px)" }
                        : { opacity: 0, scale: 1.06, filter: "blur(14px)" }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.2, ease: easeOut }
                      : { duration: 0.85, ease: easeOut }
                  }
                  style={{ transformStyle: "preserve-3d" }}
                />
                <div className="-mt-1 h-px w-[74%] bg-gradient-to-r from-transparent via-primary/65 to-transparent blur-[1px]" />
                <div className="-mt-1 h-6 w-[62%] bg-primary/20 blur-2xl" />
              </div>
            </motion.div>

            {isImageLoaded && !prefersReducedMotion && (
              <motion.div
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
