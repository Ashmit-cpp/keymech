export default function AdminInventory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-muted-foreground">Track and manage product inventory</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <p className="text-3xl font-bold">89</p>
          <p className="text-sm text-muted-foreground">in catalog</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Low Stock</h3>
          <p className="text-3xl font-bold text-orange-600">5</p>
          <p className="text-sm text-muted-foreground">items need attention</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Out of Stock</h3>
          <p className="text-3xl font-bold text-red-600">2</p>
          <p className="text-sm text-muted-foreground">items unavailable</p>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search inventory..."
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <select className="px-3 py-2 border rounded-md">
              <option>All Stock Levels</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">SKU</th>
                <th className="text-left p-4">Current Stock</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded"></div>
                    <div>
                      <p className="font-medium">Keychron K8</p>
                      <p className="text-sm text-muted-foreground">Wireless Keyboard</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">KC-K8-WHT</td>
                <td className="p-4">45</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    In Stock
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-primary hover:underline text-sm">Update Stock</button>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded"></div>
                    <div>
                      <p className="font-medium">Cherry MX Blues</p>
                      <p className="text-sm text-muted-foreground">Clicky Switches</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">CH-MX-BLU</td>
                <td className="p-4">3</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                    Low Stock
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-primary hover:underline text-sm">Update Stock</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
