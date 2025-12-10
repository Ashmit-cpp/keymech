export default function AccountAddresses() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Addresses</h1>
          <p className="text-muted-foreground">Manage your shipping and billing addresses</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
          Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Home Address</h3>
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">Default</span>
          </div>
          <div className="space-y-1 text-muted-foreground">
            <p>John Doe</p>
            <p>123 Main Street</p>
            <p>Apt 4B</p>
            <p>New York, NY 10001</p>
            <p>United States</p>
          </div>
          <div className="flex space-x-2 mt-4">
            <button className="text-primary hover:underline text-sm">Edit</button>
            <button className="text-red-500 hover:underline text-sm">Delete</button>
          </div>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Work Address</h3>
          <div className="space-y-1 text-muted-foreground">
            <p>John Doe</p>
            <p>456 Business Ave</p>
            <p>Suite 200</p>
            <p>New York, NY 10002</p>
            <p>United States</p>
          </div>
          <div className="flex space-x-2 mt-4">
            <button className="text-primary hover:underline text-sm">Edit</button>
            <button className="text-red-500 hover:underline text-sm">Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}
