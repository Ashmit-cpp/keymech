import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, User, X, LogOut, Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import { useCartControllerGetCart, useAuthControllerLogout } from "@/api/generated";
import { useGuestCartStore } from "@/stores/cart-store";
import { useGuestWishlistStore } from "@/stores/wishlist-store";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Keyboards", path: "/category/keyboards" },
  { label: "Switches", path: "/category/switches" },
  { label: "Keycaps", path: "/category/keycaps" },
  { label: "Accessories", path: "/category/accessories" },
  { label: "Group Buys", path: "/products" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const queryClient = useQueryClient();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const guestCartItems = useGuestCartStore((state) => state.items);
  const guestWishlistItems = useGuestWishlistStore((state) => state.items);
  const logoutMutation = useAuthControllerLogout({
    mutation: {
      onSuccess: () => {
        clearAuth();
        queryClient.clear();
        toast.success("Signed out successfully");
        navigate("/");
      },
      onError: () => {
        toast.error("Failed to sign out");
      },
    },
  });

  // Get cart data to show item count (only for authenticated users)
  const { data: cartData } = useCartControllerGetCart({
    query: {
      enabled: isAuthenticated, // Only run for authenticated users
      retry: false,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Calculate cart item count for both authenticated and guest users
  const authenticatedCartItemCount = (cartData?.data as any)?.items?.length || 0;
  const guestCartItemCount = guestCartItems.length;
  const cartItemCount = isAuthenticated ? authenticatedCartItemCount : guestCartItemCount;

  // Calculate wishlist item count (mainly for guest users)
  const wishlistItemCount = guestWishlistItems.length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (value: string) => {
    const term = value.trim();
    if (!term) return;
    navigate(`/products?search=${encodeURIComponent(term)}`);
    setShowSearch(false);
    setMobileMenuOpen(false);
  };

  async function handleLogout() {
    if (logoutMutation.status === "pending") return;
    await logoutMutation.mutateAsync();
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-primary/25 bg-background/82 shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl"
          : "border-b border-white/5 bg-background/18 backdrop-blur-[2px]"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-60" />

      <div className="mx-auto flex h-16 w-full max-w-[1720px] items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Logo */}
        <Button
          variant="link"
          size="sm"
          className="group flex items-center gap-2 px-0 no-underline hover:no-underline"
          onClick={() => handleNav("/")}
          aria-label="Go to home"
        >
          <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            KeyMech
          </span>
        </Button>

        {/* Desktop Links */}
        <div className="hidden items-center gap-3 md:flex">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.path}
              variant="link"
              size="sm"
              className={cn(
                "relative h-9 rounded-[1px] px-3 text-sm font-medium no-underline transition-colors hover:no-underline",
                pathname === link.path
                  ? "bg-primary/12 text-primary shadow-[inset_0_-1px_0_hsl(var(--primary)/0.55)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
              onClick={() => handleNav(link.path)}
            >
              {link.label}
            </Button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex">
            {showSearch && (
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit(searchTerm);
                }}
              >
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products"
                  className="h-9 w-48 border-primary/20 bg-background/70"
                />
                <Button type="submit" size="icon" variant="secondary" className="h-9 w-9 border border-primary/20">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            )}
            {!showSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 border border-white/8 bg-background/25 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>
            
          <Button
            variant="outline"
            size="icon"
            className="relative h-9 w-9 border-white/10 bg-background/25 hover:border-primary/35 hover:bg-primary/10 hover:text-primary"
            onClick={() => handleNav("/cart")}
          >
            <ShoppingCart className="h-4 w-4" />
            {cartItemCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] leading-none"
              >
                {cartItemCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="relative h-9 w-9 border-white/10 bg-background/25 hover:border-primary/35 hover:bg-primary/10 hover:text-primary"
            onClick={() => handleNav("/wishlist")}
          >
            <Heart className="h-4 w-4" />
            {wishlistItemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {wishlistItemCount > 9 ? '9+' : wishlistItemCount}
              </Badge>
            )}
          </Button>
          {/* <ModeToggle /> */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user?.name && (
                  <>
                    <div className="px-2 py-1.5 text-sm font-semibold">
                      {user.name}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => handleNav("/account")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNav("/account/orders")}>
                  Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNav("/account/settings")}
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hidden border border-transparent px-4 font-semibold hover:border-primary/25 hover:bg-primary/10 hover:text-primary sm:flex"
              onClick={() => handleNav("/auth/login")}
            >
              Sign In
            </Button>
          )}
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="border border-white/10 bg-background/25 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute w-full animate-in slide-in-from-top-2 border-b border-primary/20 bg-background/95 px-4 py-4 shadow-[0_18px_44px_rgba(0,0,0,0.24)] backdrop-blur-xl md:hidden">
          <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
          <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products"
              className="flex-1"
            />
            <Button
              size="icon"
              variant="secondary"
              onClick={() => handleSearchSubmit(searchTerm)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              className={cn(
                "rounded-[1px] px-2 py-2 text-left text-sm font-medium transition-colors",
                pathname === link.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-primary",
              )}
              onClick={() => handleNav(link.path)}
            >
              {link.label}
            </button>
          ))}
          <Separator className="my-2" />
          {isAuthenticated ? (
            <div className="space-y-2">
              {user?.name && (
                <p className="text-sm font-semibold px-2">{user.name}</p>
              )}
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleNav("/account")}
              >
                My Account
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => handleNav("/auth/login")}
              >
                Log In
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleNav("/auth/register")}
              >
                Sign Up
              </Button>
            </div>
          )}
          </div>
        </div>
      )}
    </nav>
  );
}
