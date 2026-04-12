import Hero from "@/components/Hero";
import React from "react";
import ProductSection from "@/components/ProductSection";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main>
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
