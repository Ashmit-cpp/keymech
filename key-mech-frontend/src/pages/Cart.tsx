import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useCartControllerGetCart,
  useCartControllerAddItem,
  useCartControllerRemoveItem,
  getCartControllerGetCartQueryKey,
  useOrdersControllerCreateRazorpayOrder,
  useOrdersControllerVerifyPayment,
} from "@/api/generated";
import { LoadingState } from "@/components/ui/loading-state";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestCartStore } from "@/stores/cart-store";

// Declare Razorpay type for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

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

export default function CartPage() {
  const [isCheckoutLoading, setCheckoutLoading] = useState(false);
  const [isRazorpayLoaded, setRazorpayLoaded] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const guestCartItems = useGuestCartStore((state) => state.items);
  const updateGuestQuantity = useGuestCartStore((state) => state.updateQuantity);
  const removeGuestItem = useGuestCartStore((state) => state.removeItem);
  const createRazorpayOrder = useOrdersControllerCreateRazorpayOrder();
  const verifyPayment = useOrdersControllerVerifyPayment();
  
  // Only fetch user cart if authenticated
  const { data, isLoading, error } = useCartControllerGetCart({
    query: { 
      enabled: isAuthenticated, // Only run if authenticated
      retry: 1,
      retryDelay: 500,
    },
  });

  // Load Razorpay script dynamically
  useEffect(() => {
    if (isRazorpayLoaded || typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [isRazorpayLoaded]);

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
              const price = `₹${(priceCents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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
              const price = `₹${(priceCents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
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
                <span>₹{(subtotal / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{(subtotal / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
              </div>
            </CardContent>
            <CardFooter>
                <Button
                  className="w-full"
                  disabled={
                    !hasItems ||
                    !isAuthenticated ||
                    isMutating ||
                    isCheckoutLoading ||
                    createRazorpayOrder.status === "pending" ||
                    verifyPayment.status === "pending"
                  }
                  onClick={async () => {
                    if (isCheckoutLoading) return;
                    if (!isAuthenticated) {
                      toast.info("Please sign in to checkout", {
                        description: "You need to be signed in to complete your order",
                      });
                      navigate("/auth/login");
                      return;
                    }
                    if (!subtotal) {
                      toast.info("Your cart is empty.");
                      return;
                    }

                    if (!isRazorpayLoaded || !window.Razorpay) {
                      toast.error("Payment system is loading. Please wait a moment and try again.");
                      return;
                    }

                    try {
                      setCheckoutLoading(true);
                      if (!user?.id) {
                        toast.error("Unable to create order. Please re-login.");
                        navigate("/auth/login");
                        return;
                      }

                      // Create Razorpay order on backend (includes keyId)
                      const orderResponse = await createRazorpayOrder.mutateAsync({
                        data: { userId: user.id },
                      });

                      // Extract data from response
                      const razorpayOrder = orderResponse.data;
                      if (!razorpayOrder?.keyId || !razorpayOrder?.orderId) {
                        toast.error("Payment initialization failed. Missing order details.");
                        setCheckoutLoading(false);
                        return;
                      }

                      // Open Razorpay payment modal with key from backend
                      const rzp = new window.Razorpay({
                        key: razorpayOrder.keyId,
                        amount: razorpayOrder.amount,
                        currency: razorpayOrder.currency,
                        order_id: razorpayOrder.orderId,
                        name: "KeyMech",
                        description: "Order payment for mechanical keyboards",
                        image: "/favicon.ico",
                        handler: async (response: any) => {
                          try {
                            // Verify payment on backend
                            await verifyPayment.mutateAsync({
                              data: {
                                userId: user.id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                              },
                            });

                            toast.success("Payment successful!", {
                              description: `Payment ID: ${response.razorpay_payment_id}`,
                            });

                            // Invalidate cart query to refresh
                            queryClient.invalidateQueries({ 
                              queryKey: getCartControllerGetCartQueryKey() 
                            });

                            // Navigate to orders page
                            navigate("/orders");
                          } catch (verifyErr: any) {
                            toast.error("Payment verification failed", {
                              description: verifyErr?.message || "Please contact support",
                            });
                            setCheckoutLoading(false);
                          }
                        },
                        modal: {
                          ondismiss: () => {
                            toast.info("Payment cancelled");
                            setCheckoutLoading(false);
                          },
                        },
                        theme: { 
                          color: "#0ea5e9",
                          backdrop_color: "rgba(0, 0, 0, 0.5)"
                        },
                        prefill: {
                          name: user?.name || "",
                          email: user?.email || "",
                        },
                      });
                      
                      rzp.on("payment.failed", (response: any) => {
                        toast.error("Payment failed", {
                          description: response.error?.description || "Please try again",
                        });
                        setCheckoutLoading(false);
                      });

                      rzp.open();
                    } catch (err: any) {
                      toast.error(err?.message || "Payment initialization failed");
                      setCheckoutLoading(false);
                    }
                  }}
                >
                  {isCheckoutLoading 
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
