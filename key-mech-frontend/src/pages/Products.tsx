import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useProductsControllerFindAll } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search")?.trim().toLowerCase() || "";
  const { data: response, isLoading, error, refetch, isFetching } = useProductsControllerFindAll(
    { search: searchTerm, category: "" },
    { query: { queryKey: ["products", searchTerm] } }
  );

  const products = useMemo(() => {
    if (!Array.isArray(response?.data)) return [];
    return response.data;
  }, [response]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((p: any) => {
      const nameMatch = (p.name || "").toLowerCase().includes(searchTerm);
      const categoryMatch = (p.category || "").toLowerCase().includes(searchTerm);
      return nameMatch || categoryMatch;
    });
  }, [products, searchTerm]);

  const handleProductClick = (product: any) => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-background pt-14 pb-8">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Catalog</p>
            <h1 className="text-3xl font-bold">All Products</h1>
          </div>
          <Button variant="outline" size="sm" disabled={isFetching} onClick={() => refetch()}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {searchTerm ? "No products matched your search." : "No products available right now."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
