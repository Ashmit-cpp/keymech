import { Outlet } from 'react-router-dom'

export default function AccountLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Account Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">My Account</h1>
        </div>
      </header>

      <div className="flex">
        {/* Account Sidebar */}
        <aside className="w-64 border-r p-4">
          <nav className="space-y-2">
            <div className="text-sm font-medium">Dashboard</div>
            <div className="text-sm font-medium">Orders</div>
            <div className="text-sm font-medium">Profile</div>
            <div className="text-sm font-medium">Addresses</div>
            <div className="text-sm font-medium">Wishlist</div>
            <div className="text-sm font-medium">Settings</div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
