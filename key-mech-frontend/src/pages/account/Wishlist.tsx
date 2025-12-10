import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useWishlistControllerGetWishlist,
  useWishlistControllerRemoveItem,
  useWishlistControllerMergeGuestWishlist,
  getWishlistControllerGetWishlistQueryKey,
  useCartControllerAddItem,
} from "@/api/generated";
import { LoadingState } from "@/components/ui/loading-state";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestWishlistStore } from "@/stores/wishlist-store";
import { useGuestCartStore } from "@/stores/cart-store";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

const parseFirstImage = (images?: string | null): string | null => {
  if (!images) return null;
  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed) && parsed[0]) return parsed[0] as string;
  } catch {
    return null;
  }
  return null;
};

export default function WishlistPage() {
  const [isMerging, setIsMerging] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Wishlist stores
  const guestWishlistItems = useGuestWishlistStore((state) => state.items);
  const guestWishlistMergeItems = useGuestWishlistStore((state) => state.getMergeItems);
  const removeGuestWishlistItem = useGuestWishlistStore((state) => state.removeItem);

  // Cart store for adding items to cart
  const addGuestCartItem = useGuestCartStore((state) => state.addItem);

  // API hooks for authenticated wishlist
  const { data, isLoading, error } = useWishlistControllerGetWishlist({
    query: {
      enabled: isAuthenticated,
      retry: 1,
      retryDelay: 500,
    },
  });

  const removeWishlistMutation = useWishlistControllerRemoveItem();
  const mergeWishlistMutation = useWishlistControllerMergeGuestWishlist();
  const addCartMutation = useCartControllerAddItem();

  const isMutating =
    removeWishlistMutation.status === "pending" ||
    mergeWishlistMutation.status === "pending" ||
    addCartMutation.status === "pending";

  // Handle guest to authenticated wishlist merge
  useEffect(() => {
    if (isAuthenticated && guestWishlistItems.length > 0 && !isMerging) {
      const mergeItems = guestWishlistMergeItems()
        .filter(item => item.productId || item.variantId)
        .map(item => ({
          productId: item.productId || undefined,
          variantId: item.variantId || undefined,
        }));

      if (mergeItems.length > 0) {
        setIsMerging(true);
        mergeWishlistMutation.mutate(
          { data: { items: mergeItems as any } },
          {
            onSuccess: (response) => {
              const addedCount = (response as any)?.data?.addedItems || 0;
              toast.success("Wishlist merged!", {
                description: `Added ${addedCount} item${addedCount === 1 ? '' : 's'} from your guest wishlist`,
              });
              queryClient.invalidateQueries({
                queryKey: getWishlistControllerGetWishlistQueryKey(),
              });
            },
            onError: (error: any) => {
              toast.error("Failed to merge wishlist", {
                description: error?.message || "Please try again",
              });
            },
            onSettled: () => {
              setIsMerging(false);
            },
          }
        );
      }
    }
  }, [
    isAuthenticated,
    guestWishlistItems.length,
    guestWishlistMergeItems,
    mergeWishlistMutation,
    queryClient,
    isMerging,
  ]);

  // Use authenticated wishlist or guest wishlist
  const userItems: any[] = (data as any)?.data ?? [];
  const items = isAuthenticated ? userItems : [];
  const guestItems = !isAuthenticated ? guestWishlistItems : [];

  // Combine items for display
  const displayItems = isAuthenticated ? items : guestItems;

  const handleAddToCart = async (product: any, variantId?: string) => {
    if (!isAuthenticated) {
      // Handle guest cart
      addGuestCartItem(product, variantId, 1);
      toast.success("Added to cart");
      return;
    }

    // Handle authenticated cart
    if (!user?.id) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    try {
      await addCartMutation.mutateAsync({
        data: {
          productId: product.id,
          variantId: variantId || undefined,
          quantity: 1,
        },
      });
      toast.success("Added to cart");
    } catch (error: any) {
      toast.error(error?.message || "Failed to add to cart");
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    if (!isAuthenticated) {
      // Handle guest wishlist
      const item = guestItems.find((i) => i.productId === itemId);
      if (item) {
        removeGuestWishlistItem(item.productId, item.variantId);
        toast.success("Removed from wishlist");
      }
      return;
    }

    // Handle authenticated wishlist
    try {
      await removeWishlistMutation.mutateAsync({ wishlistItemId: itemId });
      toast.success("Removed from wishlist");
      queryClient.invalidateQueries({
        queryKey: getWishlistControllerGetWishlistQueryKey(),
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to remove from wishlist");
    }
  };

  if (isAuthenticated && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState label="Loading wishlist..." />
      </div>
    );
  }

  if (isAuthenticated && error && !(error as Error).message.includes("404")) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <p className="text-destructive">Failed to load wishlist.</p>
      </div>
);
  }

  const hasItems = displayItems.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-background pt-24 pb-20">
      <div className="flex items-center gap-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist {!isAuthenticated && '(Guest)'}</h1>
          <p className="text-muted-foreground">
            {hasItems
              ? `${displayItems.length} item${displayItems.length === 1 ? '' : 's'} saved`
              : 'Save items you love for later'
            }
          </p>
        </div>
      </div>

      {!isAuthenticated && guestItems.length > 0 && (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-sm">
            <p className="text-muted-foreground">
              Sign in to save your wishlist permanently. Your items will be preserved when you create an account or log in.
            </p>
          </CardContent>
        </Card>
      )}

      {!hasItems ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Start browsing and add items you love to your wishlist!
              </p>
              <Button onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayItems.map((item: any) => {
            const product = item.product || item;
            const variant = item.variant;
            const priceCents = (variant?.extraPrice ?? 0) + (product?.price ?? 0);
            const price = `₹${(priceCents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            const firstImage = parseFirstImage(product?.images);
            const itemId = isAuthenticated ? item.id : item.productId;

            return (
              <Card
                key={itemId}
                className="overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product?.name ?? "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Heart className="h-8 w-8" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFromWishlist(itemId)}
                    disabled={isMutating}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-2">{product?.name ?? "Product"}</h3>
                    {variant?.name && (
                      <p className="text-sm text-muted-foreground">Variant: {variant.name}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{price}</span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product, variant?.id);
                      }}
                      disabled={isMutating}
                      className="gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {isMerging && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6">
            <CardContent className="text-center space-y-4">
              <LoadingState label="Merging your wishlist..." />
              <p className="text-sm text-muted-foreground">
                Transferring your saved items to your account
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}