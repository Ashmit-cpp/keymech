import AdminRoute from '@/components/AdminRoute'
import ProtectedRoute from '@/components/ProtectedRoute'
import AccountLayout from '@/layouts/AccountLayout'
import AdminLayout from '@/layouts/AdminLayout'
import RootLayout from '@/layouts/RootLayout'
import AboutPage from '@/pages/About'
import AccountAddresses from '@/pages/account/Addresses'
import AccountDashboard from '@/pages/account/Dashboard'
import AccountOrderDetail from '@/pages/account/OrderDetail'
import AccountOrders from '@/pages/account/Orders'
import AccountProfile from '@/pages/account/Profile'
import AccountSettings from '@/pages/account/Settings'
import WishlistPage from '@/pages/account/Wishlist'
import AdminAnalytics from '@/pages/admin/Analytics'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminInventory from '@/pages/admin/Inventory'
import AdminOrderDetail from '@/pages/admin/OrderDetail'
import AdminOrders from '@/pages/admin/Orders'
import AdminProductCreate from '@/pages/admin/ProductCreate'
import AdminProductEdit from '@/pages/admin/ProductEdit'
import AdminProducts from '@/pages/admin/Products'
import AdminSettings from '@/pages/admin/Settings'
import AdminUsers from '@/pages/admin/Users'
import ForgotPasswordPage from '@/pages/auth/ForgotPassword'
import LoginPage from '@/pages/auth/Login'
import RegisterPage from '@/pages/auth/Register'
import ResetPasswordPage from '@/pages/auth/ResetPassword'
import BlogPage from '@/pages/Blog'
import BlogPostPage from '@/pages/BlogPost'
import CartPage from '@/pages/Cart'
import CategoryPage from '@/pages/Category'
import CheckoutPage from '@/pages/Checkout'
import ContactPage from '@/pages/Contact'
import HomePage from '@/pages/Home'
import NotFoundPage from '@/pages/NotFound'
import OrderConfirmationPage from '@/pages/OrderConfirmation'
import ProductDetailPage from '@/pages/ProductDetail'
import ProductsPage from '@/pages/Products'
import UnauthorizedPage from '@/pages/Unauthorized'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'



const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // Public Routes
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'blog',
        children: [
          {
            index: true,
            element: <BlogPage />,
          },
          {
            path: ':slug',
            element: <BlogPostPage />,
          },
        ],
      },

      // Product Routes
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <ProductsPage />,
          },
          {
            path: ':id',
            element: <ProductDetailPage />,
          },
        ],
      },

      // Category Routes
      {
        path: 'category/:category',
        element: <CategoryPage />,
      },

      // Specific Category Pages
      {
        path: 'keyboards',
        element: <CategoryPage />,
      },
      {
        path: 'switches',
        element: <CategoryPage />,
      },
      {
        path: 'keycaps',
        element: <CategoryPage />,
      },
      {
        path: 'accessories',
        element: <CategoryPage />,
      },

      // Shopping Cart & Checkout
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'wishlist',
        element: <WishlistPage />,
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'order-confirmation/:orderId',
        element: (
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        ),
      },

      // User Account Routes
      {
        path: 'account',
        element: (
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AccountDashboard />,
          },
          {
            path: 'orders',
            children: [
              {
                index: true,
                element: <AccountOrders />,
              },
              {
                path: ':orderId',
                element: <AccountOrderDetail />,
              },
            ],
          },
          {
            path: 'profile',
            element: <AccountProfile />,
          },
          {
            path: 'addresses',
            element: <AccountAddresses />,
          },
          {
            path: 'settings',
            element: <AccountSettings />,
          },
        ],
      },

      // Admin Routes
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'products',
            children: [
              {
                index: true,
                element: <AdminProducts />,
              },
              {
                path: 'create',
                element: <AdminProductCreate />,
              },
              {
                path: 'edit/:productId',
                element: <AdminProductEdit />,
              },
            ],
          },
          {
            path: 'orders',
            children: [
              {
                index: true,
                element: <AdminOrders />,
              },
              {
                path: ':orderId',
                element: <AdminOrderDetail />,
              },
            ],
          },
          {
            path: 'users',
            element: <AdminUsers />,
          },
          {
            path: 'inventory',
            element: <AdminInventory />,
          },
          {
            path: 'analytics',
            element: <AdminAnalytics />,
          },
          {
            path: 'settings',
            element: <AdminSettings />,
          },
        ],
      },
    ],
  },

  // Auth Routes (full-screen layouts, no wrapper needed)
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/register',
    element: <RegisterPage />,
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/auth/reset-password/:token',
    element: <ResetPasswordPage />,
  },

  // Error Routes
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}

export { router }