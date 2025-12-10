import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl font-bold text-muted-foreground mb-4">403</div>
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-xl text-muted-foreground mb-8">
          You don't have permission to access this page.
        </p>
        <div className="space-x-4">
          <Link
            to="/auth/login"
            className="bg-primary text-primary-foreground px-6 py-3 rounded hover:bg-primary/90"
          >
            Sign In
          </Link>
          <Link
            to="/"
            className="border px-6 py-3 rounded hover:bg-muted"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
