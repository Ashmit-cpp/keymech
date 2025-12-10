import { Outlet } from 'react-router-dom'

export default function AccountLayout() {
  return (
    <div className="min-h-screen bg-background pt-14">
      {/* Account Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">My Account</h1>
        </div>
      </header>

        {/* Main content */}
        <main className="flex-1 p-6 container mx-auto px-4">
          <Outlet />
        </main>
    </div>
  )
}
