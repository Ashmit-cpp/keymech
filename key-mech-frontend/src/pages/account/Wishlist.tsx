import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCartControllerAddItem, useProductsControllerFindOne, getProductsControllerFindOneQueryKey } from "@/api/generated";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestCartStore } from "@/stores/cart-store";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  productId: string;
  variantId?: string | null;
}

const DEMO_USER_ID = import.meta.env.VITE_DEMO_USER_ID || "";

const mockWishlist: WishlistItem[] = [
  {
    id: "w1",
    name: "Mechanical Keyboard Model X",
    price: 12999,
    image: "",
    productId: "",
  },
  {
    id: "w2",
    name: "Cherry MX Red Switches",
    price: 2499,
    image: "",
    productId: "",
  },
  {
    id: "w3",
    name: "Custom Keycaps Set",
    price: 4999,
    image: "",
    productId: "",
  },
];

export default function AccountWishlist() {
  const { user, isAuthenticated } = useAuthStore();
  const userId = useMemo(() => user?.id || DEMO_USER_ID || "", [user]);
  const queryClient = useQueryClient();

  const addGuestItem = useGuestCartStore((state) => state.addItem);

  const addMutation = useCartControllerAddItem();

  const handleAddToCart = async (item: WishlistItem) => {
    // Guest path: store locally
    if (!isAuthenticated) {
      if (!item.productId) {
        toast.error("Missing product. Please sign in to add this item.");
        return;
      }

      // Fetch product data first for guest cart
      try {
        const productData = await queryClient.fetchQuery({
          queryKey: getProductsControllerFindOneQueryKey(item.productId),
          queryFn: () => fetch(`/api/products/${item.productId}`).then(res => res.json()),
        });
        const product = productData.data || productData;

        addGuestItem(product, item.variantId ?? undefined, 1);
        toast.success("Added to cart");
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error("Failed to add item to cart. Please try again.");
      }
      return;
    }

    if (!userId) {
      toast.error("No user available. Please sign in.");
      return;
    }

    try {
      await addMutation.mutateAsync({
        userId,
        data: {
          productId: item.productId || "",
          variantId: item.variantId ?? undefined,
          quantity: 1,
        },
      });
      toast.success("Added to cart");
    } catch (error: any) {
      // Ignore aborts from React Query cancellations
      if (error?.name === "AbortError") return;
      toast.error(error?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wishlist</h1>
        <p className="text-muted-foreground">Your saved items</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWishlist.map((item) => (
          <Card key={item.id} className={cn("overflow-hidden border-border")}>
            <div className="aspect-square bg-muted relative">
              <button className="absolute top-2 right-2 text-destructive hover:opacity-80">
                ×
              </button>
            </div>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-muted-foreground">${(item.price / 100).toFixed(2)}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex space-x-2">
              <Button className="flex-1" onClick={() => handleAddToCart(item)} disabled={addMutation.isLoading}>
                {addMutation.isLoading ? "Adding..." : "Add to Cart"}
              </Button>
              <Button variant="outline" className="flex-1">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
