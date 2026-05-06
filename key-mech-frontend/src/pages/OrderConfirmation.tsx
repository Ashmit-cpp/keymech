import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { useOrdersControllerFindOne } from "@/api/generated";

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { data, isLoading, error } = useOrdersControllerFindOne(orderId, {
    query: { enabled: Boolean(orderId) },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <LoadingState label="Loading order..." />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container mx-auto px-4 py-24">
        <p className="text-destructive">Unable to load this order.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-600" />
        <h1 className="text-3xl font-bold">Order Confirmed</h1>
        <p className="mt-2 text-muted-foreground">
          Your payment was verified and your order is ready for processing.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/products">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/account/orders/${data.data.id}`}>View Order Details</Link>
          </Button>
        </div>
      </div>

      <OrderDetailView order={data.data} />
    </div>
  );
}
