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
    <section className="relative z-10 overflow-visible bg-background pt-5">

  
    <section className="relative overflow-visible bg-transparent py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-18%] top-[-26rem] h-[46rem] w-[72rem] rounded-full bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.14),hsl(var(--primary)/0.06)_44%,transparent_76%)] blur-[92px]"
      />
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
  
</section>
  
  );
};

export default ProductSection;
