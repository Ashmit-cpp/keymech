import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PackageCheck, Truck, CircleDot } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
}

interface OrderSummary {
  id: string;
  placedOn: string;
  total: string;
  status: "delivered" | "shipped" | "processing";
  statusLabel: string;
  items: OrderItem[];
  actionLabel: string;
}

const orders: OrderSummary[] = [
  {
    id: "1234",
    placedOn: "January 15, 2024",
    total: "$129.99",
    status: "delivered",
    statusLabel: "Delivered",
    items: [{ name: "Mechanical Keyboard Model X", quantity: 1 }],
    actionLabel: "View details",
  },
  {
    id: "1233",
    placedOn: "January 10, 2024",
    total: "$89.99",
    status: "shipped",
    statusLabel: "Shipped",
    items: [{ name: "Cherry MX Switches (Pack of 10)", quantity: 1 }],
    actionLabel: "Track package",
  },
  {
    id: "1232",
    placedOn: "January 2, 2024",
    total: "$59.00",
    status: "processing",
    statusLabel: "Processing",
    items: [{ name: "Desk Mat - Smoke Grey", quantity: 1 }],
    actionLabel: "View details",
  },
];

const statusBadge = (status: OrderSummary["status"]) => {
  switch (status) {
    case "delivered":
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">Delivered</Badge>;
    case "shipped":
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">Shipped</Badge>;
    default:
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">Processing</Badge>;
  }
};

const statusIcon = (status: OrderSummary["status"]) => {
  switch (status) {
    case "delivered":
      return <PackageCheck className="h-5 w-5 text-emerald-600" />;
    case "shipped":
      return <Truck className="h-5 w-5 text-blue-600" />;
    default:
      return <CircleDot className="h-5 w-5 text-amber-600" />;
  }
};

export default function AccountOrders() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
        <Button asChild size="sm">
          <Link to="/products">Shop more</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">Order #{order.id}</CardTitle>
                <CardDescription>Placed on {order.placedOn}</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                {statusIcon(order.status)}
                <div className="text-right">
                  <p className="font-semibold">{order.total}</p>
                  <div className="flex justify-end">{statusBadge(order.status)}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded bg-muted" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <Button variant="link" className="px-0">
                    {order.actionLabel}
                  </Button>
                </div>
              ))}
              <Separator />
              <div className="flex flex-wrap gap-2 justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/account/orders/${order.id}`}>View details</Link>
                </Button>
                {order.status === "shipped" && (
                  <Button size="sm" variant="outline">
                    Track package
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
