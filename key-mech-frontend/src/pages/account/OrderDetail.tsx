import { useParams } from 'react-router-dom'

export default function AccountOrderDetail() {
  const { orderId } = useParams()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Details</h1>
        <p className="text-muted-foreground">Order #{orderId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded"></div>
                <div className="flex-1">
                  <p className="font-medium">Mechanical Keyboard Model X</p>
                  <p className="text-sm text-muted-foreground">Quantity: 1</p>
                </div>
                <p className="font-semibold">$129.99</p>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Address:</span> 123 Main St, City, State 12345</p>
              <p><span className="font-medium">Tracking:</span> 1Z999AA1234567890</p>
              <p><span className="font-medium">Carrier:</span> UPS</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$129.99</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$5.99</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>$10.40</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>$146.38</span>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Order Status</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Order Placed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Payment Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Shipped</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Delivered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
