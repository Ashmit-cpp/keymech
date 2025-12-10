export default function AdminProducts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
          Add New Product
        </button>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <select className="px-3 py-2 border rounded-md">
              <option>All Categories</option>
              <option>Keyboards</option>
              <option>Switches</option>
              <option>Keycaps</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Stock</th>
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
                      <p className="text-sm text-muted-foreground">Wireless Mechanical Keyboard</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">Keyboards</td>
                <td className="p-4">$89.99</td>
                <td className="p-4">45</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    Active
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button className="text-primary hover:underline text-sm">Edit</button>
                    <button className="text-red-500 hover:underline text-sm">Delete</button>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded"></div>
                    <div>
                      <p className="font-medium">Cherry MX Red</p>
                      <p className="text-sm text-muted-foreground">Linear Switches (Pack of 10)</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">Switches</td>
                <td className="p-4">$24.99</td>
                <td className="p-4">120</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    Active
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button className="text-primary hover:underline text-sm">Edit</button>
                    <button className="text-red-500 hover:underline text-sm">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
