import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useAuthControllerRegister, getCartControllerGetCartQueryKey, getWishlistControllerGetWishlistQueryKey, cartControllerMergeGuestCart, wishlistControllerMergeGuestWishlist } from '@/api/generated'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useGuestCartStore } from '@/stores/cart-store'
import { useGuestWishlistStore } from '@/stores/wishlist-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, User, Mail, Lock, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state) => state.setAuth)
  const guestCart = useGuestCartStore((state) => state.items)
  const clearGuestCart = useGuestCartStore((state) => state.clearCart)
  const guestWishlist = useGuestWishlistStore((state) => state.items)
  const clearGuestWishlist = useGuestWishlistStore((state) => state.clearWishlist)
  const getWishlistMergeItems = useGuestWishlistStore((state) => state.getMergeItems)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const registerMutation = useAuthControllerRegister({
    mutation: {
      onSuccess: async (response) => {
        const { user, accessToken } = response.data as any
        console.log('[REGISTER] Access token received:', accessToken ? 'YES' : 'NO')
        console.log('[REGISTER] Guest cart items:', guestCart.length)
        console.log('[REGISTER] Guest wishlist items:', guestWishlist.length)
        
        let cartMerged = false;
        let wishlistMerged = false;
        
        // Merge guest cart items into user cart BEFORE setting auth
        // This ensures we use the token directly from the response
        if (guestCart.length > 0) {
          try {
            console.log('[REGISTER] Calling merge cart with token')
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
            console.log('[REGISTER] Cart merge successful')
            clearGuestCart()
            cartMerged = true;
          } catch (error) {
            console.error('[REGISTER] Failed to merge cart:', error)
          }
        }

        // Merge guest wishlist items into user wishlist
        if (guestWishlist.length > 0) {
          try {
            console.log('[REGISTER] Calling merge wishlist with token')
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
            console.log('[REGISTER] Wishlist merge successful')
            clearGuestWishlist()
            wishlistMerged = true;
          } catch (error) {
            console.error('[REGISTER] Failed to merge wishlist:', error)
          }
        }
        
        // Set auth after merge completes
        if (user && accessToken) {
          setAuth(user, accessToken)
        }
        
        // Show appropriate toast message
        if (cartMerged && wishlistMerged) {
          toast.success('Welcome to KeyMech! 🎉', {
            description: 'Your account has been created. Cart and wishlist have been saved.'
          })
        } else if (cartMerged) {
          toast.success('Welcome to KeyMech! 🎉', {
            description: 'Your account has been created. Cart has been saved.'
          })
        } else if (wishlistMerged) {
          toast.success('Welcome to KeyMech! 🎉', {
            description: 'Your account has been created. Wishlist has been saved.'
          })
        } else {
          toast.success('Welcome to KeyMech! 🎉', {
            description: 'Your account has been created successfully.'
          })
        }
        
        // Refetch cart and wishlist with new auth
        await queryClient.invalidateQueries({ queryKey: getCartControllerGetCartQueryKey() })
        await queryClient.invalidateQueries({ queryKey: getWishlistControllerGetWishlistQueryKey() })
        
        navigate('/')
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : 'Registration failed'
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
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ').trim()
    registerMutation.mutate({
      data: {
        email,
        password,
        ...(name ? { name } : {}),
      },
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30">
      <div className="min-h-screen flex">
        
        {/* Left Side - Image */}
        <div className="hidden lg:block lg:flex-1 relative">
          <img 
            src="/signup.png" 
            alt="Sign Up Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 lg:p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Brand Header */}
            <div className="lg:hidden text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg">
                    {/* Re-import Keyboard if actually needed here, but standardizing usually implies using the img on desktop and simple text on mobile if space is tight */}
                    <User className="h-10 w-10 text-primary" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Join KeyMech
                </h1>
                <p className="text-muted-foreground text-lg">
                  Create your account and start building your perfect keyboard
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <Card className="shadow-2xl border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-xl text-center font-semibold">Create your account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        First name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alex"
                        className="h-12 text-base"
                        disabled={registerMutation.isPending}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Kim"
                        className="h-12 text-base"
                        disabled={registerMutation.isPending}
                      />
                    </div>
                  </div>

                  {/* Email Field */}
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
                      disabled={registerMutation.isPending}
                    />
                  </div>

                  {/* Password Fields */}
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
                      placeholder="Create a secure password"
                      className="h-12 text-base"
                      required
                      disabled={registerMutation.isPending}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      Confirm password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="h-12 text-base"
                      required
                      disabled={registerMutation.isPending}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      'Creating your account...'
                    ) : (
                      <>
                        Get started
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
                    <span className="bg-card px-3 text-muted-foreground font-medium">Already have an account?</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 text-base"
                  asChild
                  disabled={registerMutation.isPending}
                >
                  <Link to="/auth/login">
                    Sign in instead
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground/80 max-w-sm mx-auto">
              <p>
                By creating an account, you agree to our{' '}
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