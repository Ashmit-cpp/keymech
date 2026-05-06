import type { ReactNode } from "react";
import type { OrderResponseDto } from "@/api/generated";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  formatINR,
  formatOrderDate,
  getOrderItemSubtotal,
  getOrderStatusClassName,
  getOrderStatusLabel,
  parseFirstImage,
} from "@/lib/orders";

interface OrderDetailViewProps {
  order: OrderResponseDto;
  showCustomer?: boolean;
  aside?: ReactNode;
}

export function OrderDetailView({
  order,
  showCustomer = false,
  aside,
}: OrderDetailViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => {
              const firstImage = parseFirstImage(item.product.images);
              return (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded border bg-muted">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">No image</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.product.name}</p>
                    {item.variant?.name && (
                      <p className="text-sm text-muted-foreground">
                        Variant: {item.variant.name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Qty {item.quantity} x {formatINR(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatINR(getOrderItemSubtotal(item))}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {showCustomer && order.user && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.user.name || "Customer"}</p>
              <p className="text-muted-foreground">{order.user.email}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Placed</span>
              <span>{formatOrderDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment</span>
              <span>{order.razorpayPaymentId ? "Razorpay" : "Pending"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge className={getOrderStatusClassName(order.status)}>
                {getOrderStatusLabel(order.status)}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatINR(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {aside}
      </div>
    </div>
  );
}
