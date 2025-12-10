export default function AdminOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search orders..."
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <select className="px-3 py-2 border rounded-md">
              <option>All Status</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4">Order ID</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 font-medium">#1234</td>
                <td className="p-4">John Doe</td>
                <td className="p-4">Jan 15, 2024</td>
                <td className="p-4">$129.99</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    Processing
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button className="text-primary hover:underline text-sm">View</button>
                    <button className="text-orange-500 hover:underline text-sm">Update</button>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">#1233</td>
                <td className="p-4">Jane Smith</td>
                <td className="p-4">Jan 14, 2024</td>
                <td className="p-4">$89.99</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    Shipped
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button className="text-primary hover:underline text-sm">View</button>
                    <button className="text-orange-500 hover:underline text-sm">Update</button>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">#1232</td>
                <td className="p-4">Bob Johnson</td>
                <td className="p-4">Jan 13, 2024</td>
                <td className="p-4">$199.99</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    Delivered
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button className="text-primary hover:underline text-sm">View</button>
                    <button className="text-orange-500 hover:underline text-sm">Update</button>
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
