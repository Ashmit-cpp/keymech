import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useProductsControllerFindAll } from "@/api/generated";
import type { ProductResponseDto } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

const CATEGORY_ROUTE_MAP: Record<string, { backend: string; label: string }> = {
  keyboards: { backend: "keyboard", label: "Keyboards" },
  switches: { backend: "switch", label: "Switches" },
  keycaps: { backend: "keycap", label: "Keycaps" },
  accessories: { backend: "accessory", label: "Accessories" },
  other: { backend: "other", label: "Other" },
};

export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { backend: backendCategory, label: headingLabel } =
    CATEGORY_ROUTE_MAP[(category || "").toLowerCase()] || {
      backend: (category || "").toLowerCase(),
      label: category
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : "Category",
    };

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useProductsControllerFindAll(
    {
      search: "",
      category: backendCategory || "",
    },
    {
      query: { queryKey: ["products", backendCategory] },
    },
  );

  const products = useMemo(() => {
    if (!Array.isArray(response?.data)) return [];
    return response.data;
  }, [response]);

  const handleProductClick = (product: ProductResponseDto) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-background pt-14 pb-10">
      <div className="container mx-auto space-y-8 px-4 py-10">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-8">
          <div>
           

            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              [Category]
            </p>
            <h1 className="font-serif text-4xl font-bold uppercase leading-[0.9] tracking-[-0.035em] text-foreground md:text-6xl">
              {headingLabel}
            </h1>
            <p className="mt-4 font-medium text-muted-foreground">
              {products.length} products available
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            
            <Button
              variant="outline"
              size="sm"
              className="rounded-none border-foreground bg-background text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background"
              onClick={() => navigate("/products")}
            >
              View All
            </Button>
            <div className="mb-5 flex gap-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-3 w-5 -skew-x-32 bg-primary" />
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Loading products…" />
        ) : error ? (
          <div className="space-y-4 border border-border bg-background px-6 py-16 text-center">
            <p className="text-destructive">
              {error instanceof Error ? error.message : "Failed to load products"}
            </p>
            <Button
              size="sm"
              className="rounded-none bg-foreground text-xs uppercase tracking-[0.15em] text-background hover:bg-primary"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="space-y-4 border border-border bg-background px-6 py-16 text-center">
            <p className="font-medium text-muted-foreground">
              No products found for this category.
            </p>
            <Button
              size="sm"
              className="rounded-none bg-foreground text-xs uppercase tracking-[0.15em] text-background hover:bg-primary"
              onClick={() => navigate("/products")}
            >
              Browse all products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
