export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store's performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-3xl font-bold">$12,345</p>
          <p className="text-sm text-green-600">+12% from last month</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Orders</h3>
          <p className="text-3xl font-bold">156</p>
          <p className="text-sm text-green-600">+8% from last month</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Products</h3>
          <p className="text-3xl font-bold">89</p>
          <p className="text-sm text-muted-foreground">in inventory</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Customers</h3>
          <p className="text-3xl font-bold">1,234</p>
          <p className="text-sm text-green-600">+15% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Order #1234</p>
                <p className="text-sm text-muted-foreground">John Doe • 2 hours ago</p>
              </div>
              <span className="text-green-600 font-medium">$129.99</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Order #1233</p>
                <p className="text-sm text-muted-foreground">Jane Smith • 4 hours ago</p>
              </div>
              <span className="text-green-600 font-medium">$89.99</span>
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cherry MX Blues</p>
                <p className="text-sm text-muted-foreground">Only 3 left in stock</p>
              </div>
              <span className="text-red-600 font-medium">Low</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Keychron K8</p>
                <p className="text-sm text-muted-foreground">Only 1 left in stock</p>
              </div>
              <span className="text-red-600 font-medium">Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
