export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage user accounts</p>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <span className="font-medium">John Doe</span>
                  </div>
                </td>
                <td className="p-4">john.doe@example.com</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    Customer
                  </span>
                </td>
                <td className="p-4">Jan 2024</td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button className="text-primary hover:underline text-sm">View</button>
                    <button className="text-orange-500 hover:underline text-sm">Edit</button>
                  </div>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <span className="font-medium">Admin User</span>
                  </div>
                </td>
                <td className="p-4">admin@keymech.com</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                    Admin
                  </span>
                </td>
                <td className="p-4">Dec 2023</td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button className="text-primary hover:underline text-sm">View</button>
                    <button className="text-orange-500 hover:underline text-sm">Edit</button>
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
