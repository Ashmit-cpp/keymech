export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your store settings</p>
      </div>

      <div className="space-y-6">
        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Store Information</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Store Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  defaultValue="KeyMech"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Store Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  defaultValue="support@keymech.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Store Description</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                defaultValue="Your ultimate destination for mechanical keyboards and accessories"
              />
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
              Save Changes
            </button>
          </form>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stripe Public Key</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stripe Secret Key</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="sk_test_..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="test-mode" defaultChecked />
              <label htmlFor="test-mode" className="text-sm">Enable test mode</label>
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
              Update Payment Settings
            </button>
          </form>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Shipping Settings</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Default Shipping Cost</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-md"
                  defaultValue="5.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Free Shipping Threshold</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-md"
                  defaultValue="50.00"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="free-shipping" defaultChecked />
              <label htmlFor="free-shipping" className="text-sm">Enable free shipping</label>
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
              Update Shipping Settings
            </button>
          </form>
        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Email Settings</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">SMTP Host</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">SMTP Port</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="587"
                />
              </div>
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
              Update Email Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
