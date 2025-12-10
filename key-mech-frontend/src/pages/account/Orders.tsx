export default function AccountOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      <div className="space-y-4">
        {/* Order items will be rendered here */}
        <div className="p-6 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Order #1234</h3>
              <p className="text-muted-foreground">Placed on January 15, 2024</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">$129.99</p>
              <p className="text-sm text-green-600">Delivered</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded"></div>
            <div className="flex-1">
              <p className="font-medium">Mechanical Keyboard Model X</p>
              <p className="text-sm text-muted-foreground">Quantity: 1</p>
            </div>
            <button className="text-primary hover:underline">View Details</button>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Order #1233</h3>
              <p className="text-muted-foreground">Placed on January 10, 2024</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">$89.99</p>
              <p className="text-sm text-blue-600">Shipped</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded"></div>
            <div className="flex-1">
              <p className="font-medium">Cherry MX Switches (Pack of 10)</p>
              <p className="text-sm text-muted-foreground">Quantity: 1</p>
            </div>
            <button className="text-primary hover:underline">Track Package</button>
          </div>
        </div>
      </div>
    </div>
  )
}
