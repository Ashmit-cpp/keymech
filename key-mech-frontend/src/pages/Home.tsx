import React from "react";
import Hero from "@/components/Hero";
import Landing from "@/components/Landing";
import ProductSection from "@/components/ProductSection";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen text-foreground font-sans px-2 md:px-12 lg:px-16">
      <main className="relative isolate overflow-x-clip bg-background">
        <Landing />
        <Hero />
        <ProductSection
          title="New Arrivals"
          subtitle="The latest gear fresh from the factory."
        />
      </main>
    </div>
  );
};

export default HomePage;
