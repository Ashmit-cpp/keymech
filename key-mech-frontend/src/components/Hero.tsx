import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleShopKeyboards = () => {
    navigate("/category/keyboards");
  };

  const handleExploreBuilds = () => {
    navigate("/products");
  };

  return (
    <section className="relative overflow-hidden pt-5 bg-background">
      {/* --- LIGHT ORBS (same style as ProductSection) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px]" />
        <div className="absolute top-[6%] right-[8%] w-[220px] h-[220px] bg-secondary/8 rounded-full blur-3xl" />
        <div className="absolute top-[20%] left-[-12%] w-[520px] h-[520px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Main Layout Row */}
      <div className="flex flex-col md:flex-row min-h-screen p-10 relative z-10">
        {/* LEFT — TEXT SECTION */}
        <div className="flex-1 flex items-center">
          <div className="container px-4 space-y-8 text-center md:text-left">
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New Specter 75 Series Available Now
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Craft Your Perfect <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/80">
                Typing Experience
              </span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed">
              Premium mechanical keyboards, custom components, and artisan
              keycaps for enthusiasts who demand precision and aesthetics.
            </p>

            <div className="flex flex-row items-center gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="min-w-[160px] group"
                onClick={handleShopKeyboards}
              >
                Shop Keyboards
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="min-w-[160px]"
                onClick={handleExploreBuilds}
              >
                Explore Builds
              </Button>
            </div>

            <div className="hidden md:flex items-center justify-center md:justify-start gap-8 pt-4 ">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">2k+</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Happy Customers
                </span>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">100%</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Quality Guarantee
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — FULL HEIGHT IMAGE WITH 3D TILT */}
        <div className="md:flex-1 w-full md:w-1/2 min-h-[50vh] md:min-h-screen relative perspective-1000">
          <motion.img
            src="/bg.png"
            alt="Premium Keyboard Build"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ rotateY: 30 }}
            animate={{ rotateY: 10 }}
            whileHover={{ rotateY: 20 }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
