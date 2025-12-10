export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Insights into your store's performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold">$45,231</p>
          <p className="text-sm text-green-600">+20.1% from last month</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Orders</h3>
          <p className="text-3xl font-bold">1,429</p>
          <p className="text-sm text-green-600">+15.3% from last month</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold">3.2%</p>
          <p className="text-sm text-green-600">+0.5% from last month</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Avg. Order Value</h3>
          <p className="text-3xl font-bold">$31.67</p>
          <p className="text-sm text-green-600">+7.2% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
          <div className="h-64 bg-muted/50 rounded flex items-center justify-center">
            <p className="text-muted-foreground">Sales chart would go here</p>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded"></div>
                <span>Keychron K8</span>
              </div>
              <span className="font-medium">$2,345</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded"></div>
                <span>Cherry MX Switches</span>
              </div>
              <span className="font-medium">$1,890</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded"></div>
                <span>Custom Keycaps</span>
              </div>
              <span className="font-medium">$1,234</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">45%</p>
            <p className="text-sm text-muted-foreground">Organic Search</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">30%</p>
            <p className="text-sm text-muted-foreground">Direct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">25%</p>
            <p className="text-sm text-muted-foreground">Social Media</p>
          </div>
        </div>
      </div>
    </div>
  )
}
