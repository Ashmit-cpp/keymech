export default function AccountDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your account overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Recent Orders</h3>
          <p className="text-2xl font-bold">3</p>
          <p className="text-muted-foreground">orders this month</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Wishlist</h3>
          <p className="text-2xl font-bold">12</p>
          <p className="text-muted-foreground">items saved</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Account Balance</h3>
          <p className="text-2xl font-bold">$0.00</p>
          <p className="text-muted-foreground">available</p>
        </div>
      </div>

      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium">Order #1234 delivered</p>
              <p className="text-sm text-muted-foreground">2 days ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <p className="font-medium">Added item to wishlist</p>
              <p className="text-sm text-muted-foreground">1 week ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
