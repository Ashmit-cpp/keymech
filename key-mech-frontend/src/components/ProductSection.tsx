import React from "react";
import ProductCard from "@/components/ProductCard";
import { useNavigate } from "react-router-dom";
import { useProductsControllerFindAll } from "@/api/generated";
import type { ProductResponseDto } from "@/api/generated";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
interface ProductSectionProps {
  title: string;
  subtitle?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const {
    data: response,
    isLoading,
    error,
  } = useProductsControllerFindAll({
    search: "",
    category: "",
  });

  const products: ProductResponseDto[] = Array.isArray(response?.data)
    ? response.data
    : [];

  const handleProductClick = (product: ProductResponseDto) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <section className="relative z-10 overflow-visible border-t border-border bg-background pt-5 px-12">
      <section className="relative overflow-visible bg-transparent py-12">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                [Selected Stock]
              </p>
              <h2 className="font-serif text-4xl font-bold uppercase leading-[0.9] tracking-[-0.035em] text-foreground md:text-5xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-4 max-w-md font-medium text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 justify-end">
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="hidden rounded-none border-foreground bg-background text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background sm:inline-flex"
                onClick={() => navigate("/products")}
              >
                View All
              </Button>
              <div className="mb-5 flex gap-2 self-end" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-3 w-5 -skew-x-32 bg-primary" />
                ))}
              </div>
          
            </div>
          </div>

          {isLoading ? (
            <LoadingState label="Loading products..." />
          ) : error ? (
            <div className="border border-border bg-background px-6 py-12 text-center text-destructive">
              Error loading products:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-border bg-background px-6 py-12 text-center font-medium text-muted-foreground">
              No products found
            </div>
          ) : (
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent>
                {products.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-3/4 p-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <ProductCard
                      product={product}
                      onClick={() => handleProductClick(product)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="hidden rounded-none border-foreground bg-background text-foreground hover:bg-foreground hover:text-background md:inline-flex" />
              <CarouselNext className="hidden rounded-none border-foreground bg-background text-foreground hover:bg-foreground hover:text-background md:inline-flex" />
            </Carousel>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none border-foreground bg-background text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background"
              onClick={() => navigate("/products")}
            >
              View All
            </Button>
          </div>
        </div>
      </section>
    </section>
  );
};

export default ProductSection;
