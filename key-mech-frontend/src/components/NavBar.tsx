import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, User, X, LogOut } from "lucide-react";
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
import { ModeToggle } from "./mode-toggle";
import { useAuthStore } from "@/stores/auth-store";
import { useCartControllerGetCart, useAuthControllerLogout } from "@/api/generated";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

  // Get cart data to show item count
  const { data: cartData } = useCartControllerGetCart({
    query: {
      retry: false,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const cartItemCount = (cartData?.data as any)?.items?.length || 0;

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
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Button
          variant="link"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => handleNav("/")}
          aria-label="Go to home"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center rotate-3">
            <span className="text-primary-foreground font-bold text-lg">K</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground hover:text-primary">
            KeyMech
          </span>
        </Button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.path}
              variant="link"
              size="sm"
              className={` ${
                pathname === link.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
              onClick={() => handleNav(link.path)}
            >
              {link.label}
            </Button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
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
                  className="w-48"
                />
                <Button type="submit" size="icon" variant="secondary">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            )}
            {!showSearch && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="relative"
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
          <ModeToggle />
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
              className="hidden sm:flex"
              onClick={() => handleNav("/auth/login")}
            >
              Sign In
            </Button>
          )}
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
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
        <div className="md:hidden bg-background border-b border-border absolute w-full px-4 py-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
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
              className={`text-sm font-medium text-left transition-colors ${
                pathname === link.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
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
      )}
    </nav>
  );
}
