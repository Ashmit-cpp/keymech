import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useCartControllerGetCart,
  useCartControllerAddItem,
  useCartControllerRemoveItem,
  getCartControllerGetCartQueryKey,
} from "@/api/generated";
import { LoadingState } from "@/components/ui/loading-state";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestCartStore } from "@/stores/cart-store";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import { formatINR, parseFirstImage } from "@/lib/orders";

export default function CartPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const guestCartItems = useGuestCartStore((state) => state.items);
  const updateGuestQuantity = useGuestCartStore((state) => state.updateQuantity);
  const removeGuestItem = useGuestCartStore((state) => state.removeItem);
  const checkout = useRazorpayCheckout();
  
  // Only fetch user cart if authenticated
  const { data, isLoading, error } = useCartControllerGetCart({
    query: { 
      enabled: isAuthenticated, // Only run if authenticated
      retry: 1,
      retryDelay: 500,
    },
  });

  const addMutation = useCartControllerAddItem({
    mutation: {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getCartControllerGetCartQueryKey() });
        toast.success("Item added to cart");
      },
    },
  });
  const removeMutation = useCartControllerRemoveItem({
    mutation: {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getCartControllerGetCartQueryKey() });
        toast.success("Item removed from cart");
      },
    },
  });

  const isMutating = addMutation.status === "pending" || removeMutation.status === "pending";

  // Use authenticated cart or guest cart
  const userItems: any[] = (data as any)?.data?.items ?? [];
  const items = isAuthenticated ? userItems : [];
  const guestItems = !isAuthenticated ? guestCartItems : [];

  // Calculate subtotal for display items (works for both authenticated and guest users)
  const displayItems = isAuthenticated ? items : guestItems;
  const subtotal = displayItems.reduce((sum: number, item: any) => {
    const price = (item.variant?.extraPrice ?? 0) + (item.product?.price ?? 0);
    return sum + price * item.quantity;
  }, 0);

  const handleQuantity = async (cartItemId: string, delta: number) => {
    if (!isAuthenticated) {
      // Handle guest cart
      const target = guestItems.find((i) => i.productId === cartItemId);
      if (!target) return;
      const newQty = target.quantity + delta;
      updateGuestQuantity(target.productId, target.variantId, newQty);
      return;
    }

    // Handle authenticated cart
    const target = items.find((i: any) => i.id === cartItemId);
    if (!target) return;
    const newQty = target.quantity + delta;
    if (newQty <= 0) {
      await handleRemove(cartItemId);
      return;
    }
    await addMutation.mutateAsync({
      data: {
        productId: target.productId,
        variantId: target.variantId ?? undefined,
        quantity: delta,
      },
    });
  };

  const handleRemove = async (cartItemId: string) => {
    if (!isAuthenticated) {
      // Handle guest cart
      const target = guestItems.find((i) => i.productId === cartItemId);
      if (target) {
        removeGuestItem(target.productId, target.variantId);
      }
      return;
    }

    // Handle authenticated cart
    await removeMutation.mutateAsync({ cartItemId });
  };

  if (isAuthenticated && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState label="Loading cart..." />
      </div>
    );
  }

  if (isAuthenticated && error && (error as Error).message.includes("404")) {
    // Create empty cart display for authenticated users with no cart
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <Card>
          <CardContent className="p-6 text-muted-foreground">Your cart is empty.</CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthenticated && error) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <p className="text-destructive">Failed to load cart.</p>
      </div>
    );
  }

  const hasItems = displayItems.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-background pt-24 pb-20">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart {!isAuthenticated && '(Guest)'}</h1>
      {!isAuthenticated && guestItems.length > 0 && (
        <Card className="mb-4 bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-sm">
            <p className="text-muted-foreground">
              Sign in to save your cart and checkout. Your items will be preserved when you create an account or log in.
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {!hasItems ? (
            <Card>
              <CardContent className="p-6 text-muted-foreground">
                Your cart is empty. {!isAuthenticated && 'Sign in to see your saved items.'}
              </CardContent>
            </Card>
          ) : isAuthenticated ? (
            items.map((item: any) => {
              const priceCents = (item.variant?.extraPrice ?? 0) + (item.product?.price ?? 0);
              const price = formatINR(priceCents);
              const firstImage = parseFirstImage(item.product?.images);
              return (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded border border-border bg-muted overflow-hidden flex items-center justify-center">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={item.product?.name ?? "Product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product?.name ?? "Product"}</h3>
                      <p className="text-muted-foreground">{price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleQuantity(item.id, -1)} disabled={isMutating}>
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => handleQuantity(item.id, 1)} disabled={isMutating}>
                        +
                      </Button>
                    </div>
                    <Button variant="ghost" className="text-destructive" onClick={() => handleRemove(item.id)} disabled={isMutating}>
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            guestItems.map((item) => {
              const priceCents = (item.variant?.extraPrice ?? 0) + (item.product?.price ?? 0);
              const price = formatINR(priceCents);
              const firstImage = parseFirstImage(item.product?.images);
              return (
                <Card key={`${item.productId}-${item.variantId || 'none'}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded border border-border bg-muted overflow-hidden flex items-center justify-center">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={item.product?.name ?? "Product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product?.name ?? "Product"}</h3>
                      {item.variant?.name && (
                        <p className="text-sm text-muted-foreground">Variant: {item.variant.name}</p>
                      )}
                      <p className="text-muted-foreground">{price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantity(item.productId, -1)}
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantity(item.productId, 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleRemove(item.productId)}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

      <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatINR(0)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatINR(subtotal)}</span>
              </div>
            </CardContent>
            <CardFooter>
                <Button
                  className="w-full"
                  disabled={
                    !hasItems ||
                    !isAuthenticated ||
                    isMutating ||
                    checkout.isPending
                  }
                  onClick={() => checkout.startCheckout({ hasItems, subtotal })}
                >
                  {checkout.isPending
                    ? "Preparing checkout..." 
                    : !isAuthenticated 
                    ? "Sign in to Checkout" 
                    : "Proceed to Checkout"}
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
