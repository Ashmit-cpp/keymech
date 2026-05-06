import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  OrderResponseDtoStatus,
  useOrdersControllerFindAllForAdmin,
} from "@/api/generated";
import {
  formatINR,
  formatOrderDate,
  getOrderPreview,
  getOrderStatusClassName,
  getOrderStatusLabel,
} from "@/lib/orders";

export default function AdminOrders() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const { data, isLoading, error } = useOrdersControllerFindAllForAdmin();

  const filteredOrders = useMemo(() => {
    const orders = data?.data ?? [];
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      const customer = `${order.user?.name ?? ""} ${order.user?.email ?? ""}`;
      const matchesQuery =
        !needle ||
        order.id.toLowerCase().includes(needle) ||
        customer.toLowerCase().includes(needle) ||
        getOrderPreview(order).toLowerCase().includes(needle);
      const matchesStatus = status === "ALL" || order.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [data?.data, query, status]);

  if (isLoading) return <LoadingState label="Loading orders..." />;

  if (error) {
    return <p className="text-destructive">Unable to load admin orders.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search orders, customers, or products..."
            className="sm:max-w-md"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {Object.values(OrderResponseDtoStatus).map((value) => (
                <SelectItem key={value} value={value}>
                  {getOrderStatusLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">#{order.id}</div>
                  <div className="max-w-[220px] truncate text-xs text-muted-foreground">
                    {getOrderPreview(order)}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{order.user?.name || "Customer"}</div>
                  <div className="text-xs text-muted-foreground">
                    {order.user?.email || "No email"}
                  </div>
                </TableCell>
                <TableCell>{formatOrderDate(order.createdAt)}</TableCell>
                <TableCell>{formatINR(order.totalAmount)}</TableCell>
                <TableCell>
                  <Badge className={getOrderStatusClassName(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/orders/${order.id}`}>
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!filteredOrders.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No orders match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
