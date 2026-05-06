import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCartControllerGetCartQueryKey,
  getOrdersControllerFindForCurrentUserQueryKey,
  useOrdersControllerCreateRazorpayOrder,
  useOrdersControllerVerifyPayment,
} from "@/api/generated";
import { useAuthStore } from "@/stores/auth-store";

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    description?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    callback: (response: RazorpayFailureResponse) => void,
  ) => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal: {
    ondismiss: () => void;
  };
  theme: {
    color: string;
    backdrop_color: string;
  };
  prefill: {
    name: string;
    email: string;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface CheckoutInput {
  hasItems: boolean;
  subtotal: number;
}

export const useRazorpayCheckout = () => {
  const [isCheckoutLoading, setCheckoutLoading] = useState(false);
  const [isRazorpayLoaded, setRazorpayLoaded] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const createRazorpayOrder = useOrdersControllerCreateRazorpayOrder();
  const verifyPayment = useOrdersControllerVerifyPayment();

  useEffect(() => {
    if (isRazorpayLoaded || typeof window === "undefined") return;
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => toast.error("Failed to load payment system");
    document.body.appendChild(script);
  }, [isRazorpayLoaded]);

  const startCheckout = async ({ hasItems, subtotal }: CheckoutInput) => {
    if (isCheckoutLoading) return;
    if (!isAuthenticated) {
      toast.info("Please sign in to checkout", {
        description: "You need to be signed in to complete your order",
      });
      navigate("/auth/login");
      return;
    }
    if (!hasItems || !subtotal) {
      toast.info("Your cart is empty.");
      return;
    }
    if (!isRazorpayLoaded || !window.Razorpay) {
      toast.error("Payment system is loading. Please wait a moment and try again.");
      return;
    }

    try {
      setCheckoutLoading(true);
      const orderResponse = await createRazorpayOrder.mutateAsync();
      const razorpayOrder = orderResponse.data;

      if (!razorpayOrder?.keyId || !razorpayOrder?.orderId) {
        toast.error("Payment initialization failed. Missing order details.");
        setCheckoutLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.orderId,
        name: "KeyMech",
        description: "Order payment for mechanical keyboards",
        image: "/favicon.ico",
        handler: async (response) => {
          try {
            const verified = await verifyPayment.mutateAsync({
              data: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (!verified.data) {
              throw new Error("Payment verified but order details were missing");
            }

            toast.success("Payment successful");
            await queryClient.invalidateQueries({
              queryKey: getCartControllerGetCartQueryKey(),
            });
            await queryClient.invalidateQueries({
              queryKey: getOrdersControllerFindForCurrentUserQueryKey(),
            });
            navigate(`/order-confirmation/${verified.data.id}`);
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : "Please contact support";
            toast.error("Payment verification failed", { description: message });
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
          backdrop_color: "rgba(0, 0, 0, 0.5)",
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
      });

      rzp.on("payment.failed", (response) => {
        toast.error("Payment failed", {
          description: response.error?.description || "Please try again",
        });
        setCheckoutLoading(false);
      });

      rzp.open();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Payment initialization failed";
      toast.error(message);
      setCheckoutLoading(false);
    }
  };

  return {
    isPending:
      isCheckoutLoading ||
      createRazorpayOrder.status === "pending" ||
      verifyPayment.status === "pending",
    isRazorpayLoaded,
    startCheckout,
  };
};
