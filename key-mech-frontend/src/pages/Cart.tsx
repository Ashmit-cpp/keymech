import { useQueryClient } from "@tanstack/react-query";
import { Box, Package } from "lucide-react";
import {
  getCartControllerGetCartQueryKey,
  type CartItemResponseDto,
  useCartControllerAddGarageBuild,
  useCartControllerAddItem,
  useCartControllerGetCart,
  useCartControllerRemoveItem,
} from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { Separator } from "@/components/ui/separator";
import { getGarageBuildSnapshot } from "@/lib/garage";
import { formatINR } from "@/lib/orders";
import { getFirstImage } from "@/lib/product-utils";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

const getAuthenticatedItemPrice = (item: CartItemResponseDto) => {
  if (item.kind === "GARAGE_BUILD") {
    return item.unitPrice ?? getGarageBuildSnapshot(item.buildSnapshot)?.totalPrice ?? 0;
  }
  return (item.variant?.extraPrice ?? 0) + (item.product?.price ?? 0);
};

export default function CartPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const guestCartItems = useGuestCartStore((state) => state.items);
  const updateGuestQuantity = useGuestCartStore((state) => state.updateQuantity);
  const removeGuestItem = useGuestCartStore((state) => state.removeItem);
  const checkout = useRazorpayCheckout();

  const { data, isLoading, error } = useCartControllerGetCart({
    query: {
      enabled: isAuthenticated,
      retry: 1,
      retryDelay: 500,
    },
  });

  const invalidateCart = () =>
    queryClient.invalidateQueries({ queryKey: getCartControllerGetCartQueryKey() });

  const addMutation = useCartControllerAddItem({
    mutation: {
      onSettled: () => {
        invalidateCart();
      },
    },
  });
  const addGarageMutation = useCartControllerAddGarageBuild({
    mutation: {
      onSettled: () => {
        invalidateCart();
      },
    },
  });
  const removeMutation = useCartControllerRemoveItem({
    mutation: {
      onSettled: () => {
        invalidateCart();
        toast.success("Item removed from cart");
      },
    },
  });

  const isMutating =
    addMutation.status === "pending" ||
    addGarageMutation.status === "pending" ||
    removeMutation.status === "pending";

  const items = isAuthenticated ? data?.data.items ?? [] : [];
  const guestItems = !isAuthenticated ? guestCartItems : [];
  const subtotal = isAuthenticated
    ? items.reduce(
        (sum, item) => sum + getAuthenticatedItemPrice(item) * item.quantity,
        0,
      )
    : guestItems.reduce((sum, item) => {
        const price = (item.variant?.extraPrice ?? 0) + (item.product?.price ?? 0);
        return sum + price * item.quantity;
      }, 0);

  const handleQuantity = async (cartItemId: string, delta: number) => {
    if (!isAuthenticated) {
      const target = guestItems.find((item) => item.productId === cartItemId);
      if (!target) return;
      updateGuestQuantity(
        target.productId,
        target.variantId,
        target.quantity + delta,
      );
      return;
    }

    const target = items.find((item) => item.id === cartItemId);
    if (!target) return;
    const newQty = target.quantity + delta;
    if (newQty <= 0) {
      await handleRemove(cartItemId);
      return;
    }

    if (target.kind === "GARAGE_BUILD") {
      if (!target.garageBuildId) return;
      await addGarageMutation.mutateAsync({
        data: { garageBuildId: target.garageBuildId, quantity: delta },
      });
      return;
    }

    if (!target.productId) return;
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
      const target = guestItems.find((item) => item.productId === cartItemId);
      if (target) removeGuestItem(target.productId, target.variantId);
      return;
    }

    await removeMutation.mutateAsync({ cartItemId });
  };

  if (isAuthenticated && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState label="Loading cart..." />
      </div>
    );
  }

  if (isAuthenticated && error) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Card>
          <CardContent className="p-6 text-destructive">
            Failed to load cart.
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasItems = isAuthenticated ? items.length > 0 : guestItems.length > 0;

  return (
    <div className="container mx-auto min-h-screen bg-background px-4 pt-24 pb-20">
      <h1 className="mb-8 text-3xl font-bold">
        Shopping Cart {!isAuthenticated && "(Guest)"}
      </h1>
      {!isAuthenticated && guestItems.length > 0 ? (
        <Card className="mb-4 border-primary/20 bg-primary/5">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Sign in to save your cart and checkout.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {!hasItems ? (
            <Card>
              <CardContent className="p-6 text-muted-foreground">
                Your cart is empty.
              </CardContent>
            </Card>
          ) : isAuthenticated ? (
            items.map((item) =>
              item.kind === "GARAGE_BUILD" ? (
                <GarageCartItem
                  key={item.id}
                  item={item}
                  isMutating={isMutating}
                  onQuantity={handleQuantity}
                  onRemove={handleRemove}
                />
              ) : (
                <ProductCartItem
                  key={item.id}
                  item={item}
                  isMutating={isMutating}
                  onQuantity={handleQuantity}
                  onRemove={handleRemove}
                />
              ),
            )
          ) : (
            guestItems.map((item) => {
              const priceCents =
                (item.variant?.extraPrice ?? 0) + (item.product?.price ?? 0);
              const firstImage = getFirstImage(item.product?.images);
              return (
                <Card key={`${item.productId}-${item.variantId || "none"}`}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded border border-border bg-muted">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={item.product?.name ?? "Product"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {item.product?.name ?? "Product"}
                      </h3>
                      {item.variant?.name ? (
                        <p className="text-sm text-muted-foreground">
                          Variant: {item.variant.name}
                        </p>
                      ) : null}
                      <p className="text-muted-foreground">
                        {formatINR(priceCents)}
                      </p>
                    </div>
                    <QuantityControls
                      quantity={item.quantity}
                      disabled={false}
                      onDecrease={() => handleQuantity(item.productId, -1)}
                      onIncrease={() => handleQuantity(item.productId, 1)}
                    />
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
            <CardContent className="space-y-3 p-4">
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
                  !hasItems || !isAuthenticated || isMutating || checkout.isPending
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

function QuantityControls({
  quantity,
  disabled,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  disabled: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={onDecrease} disabled={disabled}>
        -
      </Button>
      <span>{quantity}</span>
      <Button variant="outline" size="sm" onClick={onIncrease} disabled={disabled}>
        +
      </Button>
    </div>
  );
}

function ProductCartItem({
  item,
  isMutating,
  onQuantity,
  onRemove,
}: {
  item: CartItemResponseDto;
  isMutating: boolean;
  onQuantity: (cartItemId: string, delta: number) => void;
  onRemove: (cartItemId: string) => void;
}) {
  const priceCents = getAuthenticatedItemPrice(item);
  const firstImage = getFirstImage(item.product?.images);

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded border border-border bg-muted">
          {firstImage ? (
            <img
              src={firstImage}
              alt={item.product?.name ?? "Product"}
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{item.product?.name ?? "Product"}</h3>
          {item.variant?.name ? (
            <p className="text-sm text-muted-foreground">
              Variant: {item.variant.name}
            </p>
          ) : null}
          <p className="text-muted-foreground">{formatINR(priceCents)}</p>
        </div>
        <QuantityControls
          quantity={item.quantity}
          disabled={isMutating}
          onDecrease={() => onQuantity(item.id, -1)}
          onIncrease={() => onQuantity(item.id, 1)}
        />
        <Button
          variant="ghost"
          className="text-destructive"
          onClick={() => onRemove(item.id)}
          disabled={isMutating}
        >
          Remove
        </Button>
      </CardContent>
    </Card>
  );
}

function GarageCartItem({
  item,
  isMutating,
  onQuantity,
  onRemove,
}: {
  item: CartItemResponseDto;
  isMutating: boolean;
  onQuantity: (cartItemId: string, delta: number) => void;
  onRemove: (cartItemId: string) => void;
}) {
  const snapshot = getGarageBuildSnapshot(item.buildSnapshot);
  const components = snapshot ? Object.values(snapshot.components) : [];
  const unitPrice = getAuthenticatedItemPrice(item);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded border border-border bg-muted">
          <Box className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">
              {snapshot?.name ?? "Garage Build"}
            </h3>
            {snapshot?.layout ? (
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {snapshot.layout}
              </span>
            ) : null}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {components.map((component) => component.productName).join(" / ")}
          </p>
          <p className="text-muted-foreground">{formatINR(unitPrice)}</p>
        </div>
        <QuantityControls
          quantity={item.quantity}
          disabled={isMutating}
          onDecrease={() => onQuantity(item.id, -1)}
          onIncrease={() => onQuantity(item.id, 1)}
        />
        <Button
          variant="ghost"
          className="text-destructive"
          onClick={() => onRemove(item.id)}
          disabled={isMutating}
        >
          Remove
        </Button>
      </CardContent>
    </Card>
  );
}
