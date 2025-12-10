export default function AccountProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </div>

      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                defaultValue="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                defaultValue="Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-md"
              defaultValue="john.doe@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border rounded-md"
              defaultValue="+1 (555) 123-4567"
            />
          </div>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
