import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Menu,
  User,
  X,
  LogOut,
  Heart,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCartControllerGetCart,
  useAuthControllerLogout,
} from "@/api/generated";
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
  { label: "Garage", path: "/garage" },
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
  const authenticatedCartItemCount =
    (cartData?.data as any)?.items?.length || 0;
  const guestCartItemCount = guestCartItems.length;
  const cartItemCount = isAuthenticated
    ? authenticatedCartItemCount
    : guestCartItemCount;

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
        ? "bg-[#f0efed]/95 shadow-sm backdrop-blur-sm border-b border-black/10"
        : "bg-[#f0efed]/80 border-b border-black/8 backdrop-blur-none"
    }`}
  >
    <div className="mx-auto flex h-16 w-full max-w-[1720px] items-center justify-between px-8 lg:px-12">
      {/* Logo */}
      <Button
        variant="link"
        size="sm"
        className="px-0 no-underline hover:no-underline"
        onClick={() => handleNav("/")}
        aria-label="Go to home"
      >
        <span className="text-xl font-black tracking-tight text-foreground hover:text-primary transition-colors">
          KM
        </span>
      </Button>
  
      {/* Desktop Links */}
      <div className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => (
          <Button
            key={link.path}
            variant="link"
            className={cn(
              "text-xs font-mono tracking-widest uppercase transition-colors",
              pathname === link.path
                ? "text-foreground font-semibold"
                : "text-foreground/50 hover:text-foreground",
            )}
            onClick={() => handleNav(link.path)}
          >
            {pathname === link.path ? `[${link.label}]` : link.label}
          </Button>
        ))}
      </div>
  
      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 md:flex">
          {showSearch && (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(searchTerm); }}
            >
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products"
                className="h-8 w-44 rounded-none border-black/20 bg-transparent text-xs font-mono focus-visible:ring-0 focus-visible:border-black/40"
              />
              <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 rounded-none hover:bg-black/8">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </form>
          )}
          {!showSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none hover:bg-black/8 hover:text-primary"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
  
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-none hover:bg-black/8 hover:text-primary"
          onClick={() => handleNav("/cart")}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-primary text-[9px] font-black text-white">
              {cartItemCount}
            </span>
          )}
        </Button>
  
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-none hover:bg-black/8 hover:text-primary"
          onClick={() => handleNav("/wishlist")}
        >
          <Heart className="h-3.5 w-3.5" />
          {wishlistItemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-primary text-[9px] font-black text-white">
              {wishlistItemCount > 9 ? "9+" : wishlistItemCount}
            </span>
          )}
        </Button>
  
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden h-8 w-8 rounded-none hover:bg-black/8 sm:flex">
                <User className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-black/15 bg-[#f0efed]">
              {user?.name && (
                <>
                  <div className="px-2 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider">{user.name}</div>
                  <DropdownMenuSeparator className="bg-black/10" />
                </>
              )}
              <DropdownMenuItem className="text-xs font-mono" onClick={() => handleNav("/account")}>Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-mono" onClick={() => handleNav("/account/orders")}>Orders</DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-mono" onClick={() => handleNav("/account/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-black/10" />
              <DropdownMenuItem className="text-xs font-mono text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-3.5 w-3.5" />Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
          variant="link"
            className="hidden text-xs font-mono uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors sm:block"
            onClick={() => handleNav("/auth/login")}
          >
            Sign In
          </Button>
        )}
  
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none hover:bg-black/8 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  
    {/* Mobile Menu */}
    {mobileMenuOpen && (
      <div className="absolute w-full border-b border-black/10 bg-[#f0efed] px-8 py-6 shadow-sm md:hidden">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products"
              className="flex-1 rounded-none border-black/20 bg-transparent text-xs font-mono focus-visible:ring-0"
            />
            <Button size="icon" variant="ghost" className="rounded-none hover:bg-black/8" onClick={() => handleSearchSubmit(searchTerm)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              className={cn(
                "text-left text-xs font-mono uppercase tracking-widest transition-colors",
                pathname === link.path ? "text-foreground font-semibold" : "text-foreground/50 hover:text-foreground",
              )}
              onClick={() => handleNav(link.path)}
            >
              {pathname === link.path ? `[${link.label}]` : link.label}
            </button>
          ))}
          <div className="h-px w-full bg-black/10" />
          {isAuthenticated ? (
            <div className="space-y-2">
              {user?.name && <p className="text-xs font-mono font-semibold uppercase tracking-wider">{user.name}</p>}
              <Button className="w-full rounded-none" variant="outline" onClick={() => handleNav("/account")}>My Account</Button>
              <Button className="w-full rounded-none" variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button className="flex-1 rounded-none" variant="outline" onClick={() => handleNav("/auth/login")}>Log In</Button>
              <Button className="flex-1 rounded-none bg-foreground text-background hover:bg-primary" onClick={() => handleNav("/auth/register")}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    )}
  </nav>
  );
}
