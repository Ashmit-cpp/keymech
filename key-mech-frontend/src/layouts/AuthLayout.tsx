// This layout is no longer used since auth pages have their own full-screen layouts
// Keeping for potential future use with forgot-password/reset-password pages

import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
