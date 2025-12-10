import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl font-bold text-muted-foreground mb-4">404</div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-xl text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="bg-primary text-primary-foreground px-6 py-3 rounded hover:bg-primary/90"
          >
            Go Home
          </Link>
          <Link
            to="/products"
            className="border px-6 py-3 rounded hover:bg-muted"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
