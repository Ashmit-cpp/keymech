import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <div className="flex items-center space-x-4">
              {/* Admin navigation would go here */}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 border-r bg-muted/50 p-4">
          <nav className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Dashboard</div>
            <div className="text-sm font-medium text-muted-foreground">Products</div>
            <div className="text-sm font-medium text-muted-foreground">Orders</div>
            <div className="text-sm font-medium text-muted-foreground">Users</div>
            <div className="text-sm font-medium text-muted-foreground">Analytics</div>
            <div className="text-sm font-medium text-muted-foreground">Settings</div>
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
