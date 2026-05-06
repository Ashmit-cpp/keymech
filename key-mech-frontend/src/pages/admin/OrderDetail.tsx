import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import {
  getOrdersControllerFindAllForAdminQueryKey,
  getOrdersControllerFindOneQueryKey,
  OrderResponseDtoStatus,
  useOrdersControllerFindOne,
  useOrdersControllerUpdateStatus,
} from "@/api/generated";
import { getOrderStatusLabel } from "@/lib/orders";

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useOrdersControllerFindOne(orderId, {
    query: { enabled: Boolean(orderId) },
  });
  const updateStatus = useOrdersControllerUpdateStatus({
    mutation: {
      onSuccess: async () => {
        toast.success("Order status updated");
        await queryClient.invalidateQueries({
          queryKey: getOrdersControllerFindOneQueryKey(orderId),
        });
        await queryClient.invalidateQueries({
          queryKey: getOrdersControllerFindAllForAdminQueryKey(),
        });
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Unable to update order";
        toast.error(message);
      },
    },
  });

  if (isLoading) return <LoadingState label="Loading order..." />;

  if (error || !data?.data) {
    return <p className="text-destructive">Unable to load this order.</p>;
  }

  const order = data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.id}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/admin/orders">Back to orders</Link>
        </Button>
      </div>

      <OrderDetailView
        order={order}
        showCustomer
        aside={
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fulfillment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={order.status}
                disabled={updateStatus.status === "pending"}
                onValueChange={(value) =>
                  updateStatus.mutate({
                    id: order.id,
                    data: { status: value as OrderResponseDtoStatus },
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrderResponseDtoStatus).map((value) => (
                    <SelectItem key={value} value={value}>
                      {getOrderStatusLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Tracking and invoice tools are intentionally deferred for the next fulfillment pass.
              </p>
            </CardContent>
          </Card>
        }
      />
    </div>
  );
}
