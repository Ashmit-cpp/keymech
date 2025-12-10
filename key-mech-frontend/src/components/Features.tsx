import React from "react";
import {
  Truck,
  ShieldCheck,
  Headphones,
  PenTool,
  Award,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: PenTool,
    title: "Curated Selection",
    description: "Expert-selected components from top enthusiast brands.",
    color: "text-blue-400",
  },
  {
    icon: Headphones,
    title: "Sound Tested",
    description: "High-quality sound tests available for every keyboard.",
    color: "text-purple-400",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Free shipping on orders over $100 worldwide.",
    color: "text-green-400",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    description: "Comprehensive 1-year warranty on all PCBs and cases.",
    color: "text-blue-400",
  },
  {
    icon: Award,
    title: "Expert Support",
    description: "Chat with real mechanical keyboard enthusiasts.",
    color: "text-yellow-400",
  },
  {
    icon: Zap,
    title: "Exclusive Drops",
    description: "Access to limited edition runs and collaborations.",
    color: "text-orange-400",
  },
];

const Features: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Why Shop With Us
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
          Premium components, tested quality, and a community-backed shopping
          experience.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card
              key={idx}
              className="group border-border/50 hover:shadow-xl hover:border-border transition-all duration-300 rounded-2xl"
            >
              <CardContent className="p-6 flex gap-4">
                <div className="p-3 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Features;
