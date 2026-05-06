import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { useOrdersControllerFindOne } from "@/api/generated";

export default function AccountOrderDetail() {
  const { orderId } = useParams();
  const { data, isLoading, error } = useOrdersControllerFindOne(orderId, {
    query: { enabled: Boolean(orderId) },
  });

  if (isLoading) return <LoadingState label="Loading order..." />;

  if (error || !data?.data) {
    return <p className="text-destructive">Unable to load this order.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order #{data.data.id}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/account/orders">Back to orders</Link>
        </Button>
      </div>

      <OrderDetailView order={data.data} />
    </div>
  );
}
