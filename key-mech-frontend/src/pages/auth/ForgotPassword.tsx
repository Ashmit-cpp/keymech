import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="your@email.com"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          Send Reset Link
        </button>
      </form>
      <div className="text-center">
        <Link to="/auth/login" className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
