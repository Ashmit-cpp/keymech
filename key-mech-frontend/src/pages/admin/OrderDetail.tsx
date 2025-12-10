import { useParams } from 'react-router-dom'

export default function AdminOrderDetail() {
  const { orderId } = useParams()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order #{orderId}</p>
        </div>
        <div className="flex space-x-2">
          <button className="border px-4 py-2 rounded">Print Invoice</button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
            Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded"></div>
                <div className="flex-1">
                  <p className="font-medium">Keychron K8 Wireless Mechanical Keyboard</p>
                  <p className="text-sm text-muted-foreground">Quantity: 1</p>
                </div>
                <p className="font-semibold">$89.99</p>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Customer</p>
                  <p className="text-muted-foreground">John Doe</p>
                  <p className="text-muted-foreground">john.doe@example.com</p>
                </div>
                <div>
                  <p className="font-medium">Shipping Address</p>
                  <p className="text-muted-foreground">123 Main St</p>
                  <p className="text-muted-foreground">Apt 4B</p>
                  <p className="text-muted-foreground">New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$89.99</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$5.99</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>$7.19</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>$103.17</span>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Order Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Update Status</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tracking Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter tracking number"
                />
              </div>
              <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded">
                Update Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
