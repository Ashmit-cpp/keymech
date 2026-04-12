import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const Hero: React.FC = () => {
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
    <section className="relative overflow-hidden pt-5 bg-background">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px]"
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [1, 1.06, 1], opacity: [0.12, 0.2, 0.12] }
          }
          transition={orbLoopTransition}
        />
        <motion.div
          className="absolute top-[6%] right-[8%] w-[220px] h-[220px] bg-secondary/8 rounded-full blur-3xl"
          animate={prefersReducedMotion ? undefined : { x: [0, 18, 0], y: [0, -12, 0] }}
          transition={orbLoopTransition ? { ...orbLoopTransition, duration: 11 } : undefined}
        />
        <motion.div
          className="absolute top-[20%] left-[-12%] w-[520px] h-[520px] bg-secondary/10 rounded-full blur-[120px]"
          animate={
            prefersReducedMotion ? undefined : { scale: [1, 1.05, 1], x: [0, -14, 0] }
          }
          transition={orbLoopTransition ? { ...orbLoopTransition, duration: 16 } : undefined}
        />
      </div>

      <div className="flex flex-col md:flex-row min-h-screen p-10 relative z-10">
        <div className="flex-1 flex items-center">
          <motion.div
            className="container px-4 space-y-8 text-center md:text-left"
            variants={copyContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={copyItem}>
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                New Specter 75 Series Available Now
              </Badge>
            </motion.div>

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

        <div className="md:flex-1 w-full md:w-1/2 min-h-[50vh] md:min-h-screen relative perspective-1000">
          <div
            className="absolute inset-0 md:left-2 md:right-0 md:top-4 md:bottom-4 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/40"
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
              className="absolute inset-0"
              initial={false}
              animate={
                prefersReducedMotion
                  ? { rotateY: 10 }
                  : isImageLoaded
                    ? {
                        rotateY: 10,
                        y: [0, -5, 0],
                      }
                    : { rotateY: 26 }
              }
              whileHover={
                prefersReducedMotion || !isImageLoaded
                  ? undefined
                  : { rotateY: 18, transition: { duration: 0.45, ease: easeOut } }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.35, ease: easeOut }
                  : isImageLoaded
                    ? {
                        rotateY: { duration: 1, ease: easeOut },
                        y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
                      }
                    : { duration: 0.6, ease: easeOut }
              }
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.img
                src="/bg.png"
                alt="Premium Keyboard Build"
                decoding="async"
                fetchPriority="high"
                loading="eager"
                onLoad={() => setIsImageLoaded(true)}
                className="absolute inset-0 w-full h-full object-cover"
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

export default Hero;
