import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { LoadingState } from "@/components/ui/loading-state";
import { useOrdersControllerFindForCurrentUser } from "@/api/generated";
import {
  formatINR,
  formatOrderDate,
  getOrderPreview,
  getOrderStatusClassName,
  getOrderStatusLabel,
} from "@/lib/orders";

export default function AccountOrders() {
  const { data, isLoading, error } = useOrdersControllerFindForCurrentUser();
  const orders = data?.data ?? [];

  if (isLoading) return <LoadingState label="Loading orders..." />;

  if (error) {
    return <p className="text-destructive">Unable to load orders.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track your KeyMech orders</p>
        </div>
        <Button asChild size="sm">
          <Link to="/products">Shop more</Link>
        </Button>
      </div>

      {!orders.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package />
            </EmptyMedia>
            <EmptyTitle>No orders yet</EmptyTitle>
            <EmptyDescription>
              Your confirmed orders will appear here after checkout.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base">Order #{order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:text-right">
                  <Badge className={getOrderStatusClassName(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                  <p className="font-semibold">{formatINR(order.totalAmount)}</p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{getOrderPreview(order)}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/account/orders/${order.id}`}>View details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
