import React from "react";
import Hero from "@/components/Hero";
// import CategorySection from "@/components/CategorySection";
import Landing from "@/components/Landing";
import ProductSection from "@/components/ProductSection";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen text-foreground font-sans">
      
      <main className="relative isolate overflow-x-clip bg-background">
        <Landing />
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-30 -my-56 h-[28rem] overflow-visible"
        >
          <div className="absolute left-[-14%] top-1/2 h-[540px] w-[760px] -translate-y-1/2 rounded-full bg-primary/15 blur-[155px]" />
          <div className="absolute left-[16%] top-1/2 h-[380px] w-[640px] -translate-y-[45%] rounded-full bg-white/5 blur-[150px]" />
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/18 to-transparent" />
        </div>
        <Hero />
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-0 -my-40 h-80 overflow-visible"
        >
          <div className="absolute right-[-12%] top-1/2 h-[460px] w-[700px] -translate-y-1/2 rounded-full bg-primary/12 blur-[150px]" />
          <div className="absolute right-[18%] top-1/2 h-[320px] w-[560px] -translate-y-[45%] rounded-full bg-white/4 blur-[145px]" />
        </div>
        <ProductSection
          title="New Arrivals"
          subtitle="The latest gear fresh from the factory."
        />
        {/* <CategorySection /> */}
      </main>
    </div>
  );
};

export default HomePage;
