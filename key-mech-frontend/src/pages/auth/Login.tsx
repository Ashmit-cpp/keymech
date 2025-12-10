import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useAuthControllerLogin, getCartControllerGetCartQueryKey, getWishlistControllerGetWishlistQueryKey, cartControllerMergeGuestCart, wishlistControllerMergeGuestWishlist } from '@/api/generated'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useGuestCartStore } from '@/stores/cart-store'
import { useGuestWishlistStore } from '@/stores/wishlist-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Keyboard, ArrowRight, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)
  const guestCart = useGuestCartStore((state) => state.items)
  const clearGuestCart = useGuestCartStore((state) => state.clearCart)
  const guestWishlist = useGuestWishlistStore((state) => state.items)
  const clearGuestWishlist = useGuestWishlistStore((state) => state.clearWishlist)
  const getWishlistMergeItems = useGuestWishlistStore((state) => state.getMergeItems)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Get the page they were trying to access, or default to home
  const from = (location.state as any)?.from?.pathname || '/'

  const loginMutation = useAuthControllerLogin({
    mutation: {
      onSuccess: async (response) => {
        const { user, accessToken } = response.data as any
        console.log('[LOGIN] Access token received:', accessToken ? 'YES' : 'NO')
        console.log('[LOGIN] Guest cart items:', guestCart.length)
        console.log('[LOGIN] Guest wishlist items:', guestWishlist.length)
        
        let cartMerged = false;
        let wishlistMerged = false;
        
        // Merge guest cart items into user cart BEFORE setting auth
        // This ensures we use the token directly from the response
        if (guestCart.length > 0) {
          try {
            console.log('[LOGIN] Calling merge cart with token')
            await cartControllerMergeGuestCart(
              {
                items: guestCart.map((item) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                })),
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )
            console.log('[LOGIN] Cart merge successful')
            clearGuestCart()
            cartMerged = true;
          } catch (error) {
            console.error('[LOGIN] Failed to merge cart:', error)
          }
        }

        // Merge guest wishlist items into user wishlist
        if (guestWishlist.length > 0) {
          try {
            console.log('[LOGIN] Calling merge wishlist with token')
            const wishlistItems = getWishlistMergeItems();
            await wishlistControllerMergeGuestWishlist(
              {
                items: wishlistItems.map(item => ({
                  productId: item.productId || undefined,
                  variantId: item.variantId || undefined,
                })) as any,
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )
            console.log('[LOGIN] Wishlist merge successful')
            clearGuestWishlist()
            wishlistMerged = true;
          } catch (error) {
            console.error('[LOGIN] Failed to merge wishlist:', error)
          }
        }

        // Show appropriate toast message
        if (cartMerged && wishlistMerged) {
          toast.success('Welcome back! Your cart and wishlist have been restored. 🎉')
        } else if (cartMerged) {
          toast.success('Welcome back! Your cart has been restored. 🎉')
        } else if (wishlistMerged) {
          toast.success('Welcome back! Your wishlist has been restored. 🎉')
        } else {
          toast.success('Welcome back! 🎉')
        }
        
        // Set auth after merge completes
        if (user && accessToken) {
          setAuth(user, accessToken)
        }
        
        // Refetch cart and wishlist with new auth
        await queryClient.invalidateQueries({ queryKey: getCartControllerGetCartQueryKey() })
        await queryClient.invalidateQueries({ queryKey: getWishlistControllerGetWishlistQueryKey() })
        
        // Redirect to the page they were trying to access
        navigate(from, { replace: true })
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : 'Login failed'
        toast.error(message)
      },
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    loginMutation.mutate({ data: { email, password } })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center p-8 bg-linear-to-br from-primary/5 via-primary/10 to-primary/5">
          <div className="max-w-md space-y-8">
            {/* Brand Header */}
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 shadow-xl">
                    <Keyboard className="h-16 w-16 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-foreground rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Welcome back
                </h1>
                <p className="text-muted-foreground text-xl leading-relaxed">
                  Continue your mechanical keyboard journey with KeyMech
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 lg:p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Brand Header */}
            <div className="lg:hidden text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
                    <Keyboard className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Welcome back
                </h1>
                <p className="text-muted-foreground text-lg">
                  Sign in to continue your keyboard journey
                </p>
              </div>
            </div>

            {/* Login Form */}
            <Card className="shadow-2xl border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-xl text-center font-semibold">Sign in to your account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-12 text-base"
                      required
                      disabled={loginMutation.isPending}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 text-base"
                      required
                      disabled={loginMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        disabled={loginMutation.isPending}
                      />
                      Remember me
                    </label>
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      'Signing you in...'
                    ) : (
                      <>
                        Continue with email
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground font-medium">New to KeyMech?</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 text-base"
                  asChild
                  disabled={loginMutation.isPending}
                >
                  <Link to="/auth/register">
                    Create an account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground/80 max-w-sm mx-auto">
              <p>
                By signing in, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
