import React from "react";
import Hero from "@/components/Hero";
// import CategorySection from "@/components/CategorySection";
import Landing from "@/components/Landing";
import ProductSection from "@/components/ProductSection";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main>
        <Landing />
        <Hero />
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
