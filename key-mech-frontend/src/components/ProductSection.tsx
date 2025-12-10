import React from "react";
import ProductCard from "@/components/ProductCard";
import { useNavigate } from "react-router-dom";
import { useProductsControllerFindAll } from "@/api/generated";
import { LoadingState } from "@/components/ui/loading-state";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Features from "./Features";

interface APIProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string | null;
  status: string | null;
  images: string | null;
  gallery: any;
  variants: any[];
  keyboardSpec: any;
  switchSpec: any;
  keycapSpec: any;
}

interface ProductSectionProps {
  title: string;
  subtitle?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useProductsControllerFindAll({ search: "", category: "" });

  const products: APIProduct[] = Array.isArray(response?.data) ? response.data : [];

  const handleProductClick = (product: APIProduct) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <section className="relative overflow-hidden pt-5 bg-background">
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-secondary/15 rounded-full blur-[140px]" />
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[280px] h-[280px] bg-secondary/10 rounded-full blur-[100px]" />
      <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[160px]" />
    </div>
  
    <section className="relative py-10 bg-background/50 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
  
          <button
            type="button"
            className="text-primary font-medium hover:underline hidden sm:block"
            onClick={() => navigate("/products")}
          >
            View All
          </button>
        </div>
  
        {isLoading ? (
          <LoadingState label="Loading products…" />
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            Error loading products: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No products found</div>
        ) : (
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-2"
                >
                  <ProductCard
                    product={product}
                    onClick={() => handleProductClick(product)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
  
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
  
        <div className="mt-8 text-center sm:hidden">
          <button
            type="button"
            className="text-primary font-medium hover:underline"
            onClick={() => navigate("/products")}
          >
            View All
          </button>
        </div>
      </div>
    </section>
  
    <Features />
  </section>
  
  );
};

export default ProductSection;
