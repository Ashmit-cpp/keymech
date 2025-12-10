import { useParams } from 'react-router-dom'

export default function OrderConfirmationPage() {
  const { orderId } = useParams()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Thank you for your order. We've sent a confirmation email to your inbox.
        </p>
        <div className="bg-muted p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Order Details</h2>
          <p className="text-muted-foreground">Order ID: {orderId}</p>
          <p className="text-muted-foreground">Estimated delivery: 3-5 business days</p>
        </div>
        <div className="space-x-4">
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded">
            Continue Shopping
          </button>
          <button className="border px-6 py-2 rounded">
            View Order Details
          </button>
        </div>
      </div>
    </div>
  )
}
