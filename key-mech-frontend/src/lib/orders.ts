import type {
  OrderResponseDto,
  OrderResponseDtoStatus,
  OrderItemResponseDto,
} from "@/api/generated";

export const formatINR = (amountInPaise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amountInPaise / 100);

export const formatOrderDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const parseFirstImage = (images?: string | null): string | null => {
  if (!images) return null;
  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed[0];
  } catch {
    if (/^https?:\/\//.test(images) || images.startsWith("/")) return images;
  }
  return null;
};

export const getOrderStatusLabel = (status: OrderResponseDtoStatus) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "PAID":
      return "Paid";
    case "SHIPPED":
      return "Shipped";
    case "CANCELLED":
      return "Cancelled";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
};

export const getOrderStatusClassName = (status: OrderResponseDtoStatus) => {
  switch (status) {
    case "PAID":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200";
    case "SHIPPED":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200";
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200";
  }
};

export const getOrderItemSubtotal = (item: OrderItemResponseDto) =>
  item.price * item.quantity;

export const getOrderPreview = (order: OrderResponseDto) => {
  if (!order.items.length) return "No items";
  const [firstItem, ...rest] = order.items;
  const suffix = rest.length ? ` +${rest.length} more` : "";
  return `${firstItem.product.name}${suffix}`;
};
