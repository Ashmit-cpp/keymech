-- Harden order records for authenticated Razorpay checkout.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_razorpayPaymentId_key" ON "Order"("razorpayPaymentId");
