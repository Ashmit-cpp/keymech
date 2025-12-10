export default function ResetPasswordPage() {

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Set New Password</h2>
        <p className="text-muted-foreground">
          Enter your new password below
        </p>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Confirm New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          Update Password
        </button>
      </form>
    </div>
  )
}
