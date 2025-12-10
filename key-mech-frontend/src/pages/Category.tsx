import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useProductsControllerFindAll } from "@/api/generated";
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
      label: category ? category.charAt(0).toUpperCase() + category.slice(1) : "Category",
    };

  const { data: response, isLoading, error, refetch } = useProductsControllerFindAll(
    {
      search: "",
      category: backendCategory || "",
    },
    {
      query: { queryKey: ["products", backendCategory] },
    }
  );

  const products = useMemo(() => {
    if (!Array.isArray(response?.data)) return [];
    return response.data;
  }, [response]);

  const handleProductClick = (product: any) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-background pt-14 pb-8">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <h1 className="text-3xl font-bold">{headingLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/products")}>
              View All
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Loading products…" />
        ) : error ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-destructive">
              {error instanceof Error ? error.message : "Failed to load products"}
            </p>
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground">No products found for this category.</p>
            <Button size="sm" onClick={() => navigate("/products")}>
              Browse all products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
