import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Share2, Truck, ShieldCheck, Youtube } from "lucide-react";
import {
  useProductsControllerFindOne,
  useCartControllerAddItem,
  getCartControllerGetCartQueryKey,
  useWishlistControllerAddItem,
  getWishlistControllerGetWishlistQueryKey,
} from "@/api/generated";
import { LoadingState } from "@/components/ui/loading-state";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestCartStore } from "@/stores/cart-store";
import { useGuestWishlistStore } from "@/stores/wishlist-store";

const CATEGORY_DISPLAY_MAP: Record<string, { label: string; path: string }> = {
  keyboard: { label: "Keyboards", path: "/category/keyboards" },
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const addGuestItem = useGuestCartStore((state) => state.addItem);
  const addGuestWishlistItem = useGuestWishlistStore((state) => state.addItem);
  const isInWishlist = useGuestWishlistStore((state) => state.isInWishlist);

  const {
    data: productData,
    isLoading,
    isError,
    error,
  } = useProductsControllerFindOne(id ?? "", {
    query: { enabled: !!id },
  });

  const product = productData?.data as any;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [justAddedToWishlist, setJustAddedToWishlist] = useState(false);

  const images: string[] = useMemo(() => {
    if (!product?.images) return [];
    try {
      return JSON.parse(product.images);
    } catch {
      return [];
    }
  }, [product]);

  const soundTests: string[] = useMemo(() => {
    if (!product?.soundTests) return [];
    try {
      return JSON.parse(product.soundTests);
    } catch {
      return [];
    }
  }, [product]);

  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^"&?/\s]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const renderSpecBlock = (
    title: string,
    data: Record<string, any> | undefined | null
  ) => {
    if (!data) return null;

    const formatKey = (key: string) =>
      key
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();

    const formatValue = (value: any) => {
      if (value === null || value === undefined) return "-";
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (typeof value === "number") return value;
      if (Array.isArray(value)) return value.join(", ");
      if (typeof value === "string") {
        if (value.startsWith("[") && value.endsWith("]")) {
          try {
            return JSON.parse(value).join(", ");
          } catch {
            return value;
          }
        }
        return value;
      }
      return String(value);
    };

    return (
      <div>
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {Object.entries(data).map(([key, val]) => {
            if (key === "id" || key === "productId") return null;
            return (
              <div key={key}>
                <span className="font-medium text-foreground">
                  {formatKey(key)}:
                </span>{" "}
                {formatValue(val)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const currentPrice = useMemo(() => {
    const base = product?.price ?? 0;
    const extra = selectedVariant?.extraPrice ?? 0;
    return (base + extra) / 100;
  }, [product, selectedVariant]);

  const breadcrumbCategory = useMemo(() => {
    const key = (product?.category || "").toLowerCase();
    return (
      CATEGORY_DISPLAY_MAP[key] || {
        label: product?.category || "Category",
        path: key ? `/category/${key}` : "/products",
      }
    );
  }, [product?.category]);

  const fmt = (n: number) => `₹${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  const addToCart = useCartControllerAddItem({
    mutation: {
      mutationKey: ["cart", "add-item"],
      onSuccess: () => {
        setAddError(null);
        toast.success("Added to cart");
      },
      onError: (err: any) => {
        const message =
          err instanceof Error ? err.message : "Failed to add to cart";
        setAddError(message);
        toast.error(message);
      },
      onSettled: () => {
        // Invalidate cart query so cart page updates
        queryClient.invalidateQueries({
          queryKey: getCartControllerGetCartQueryKey(),
        });
      },
    },
  });

  const addToWishlist = useWishlistControllerAddItem({
    mutation: {
      mutationKey: ["wishlist", "add-item"],
      onSuccess: () => {
        toast.success("Added to wishlist");
      },
      onError: (err: any) => {
        const message =
          err instanceof Error ? err.message : "Failed to add to wishlist";
        toast.error(message);
      },
      onSettled: () => {
        // Invalidate wishlist query so wishlist page updates
        queryClient.invalidateQueries({
          queryKey: getWishlistControllerGetWishlistQueryKey(),
        });
      },
    },
  });

  const handleAddToCart = () => {
    if (product?.status !== "IN_STOCK" || addToCart.isPending) return;
    if (!product?.id) {
      setAddError("Missing product id");
      return;
    }
    if (product.variants?.length && !selectedVariant?.id) {
      setAddError("Please select a variant first");
      return;
    }

    // Guest path: store locally without hitting API
    if (!isAuthenticated) {
      addGuestItem(product, selectedVariant?.id, 1);
      setAddError(null);
      toast.success("Added to cart");
      return;
    }

    addToCart.mutate({
      data: {
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity: 1,
      },
    });
  };

  const handleAddToWishlist = () => {
    if (!product?.id || addToWishlist.isPending) return;

    // Check if already in wishlist (for guest users)
    if (!isAuthenticated && isInWishlist(product.id, selectedVariant?.id)) {
      toast.info("Already in wishlist");
      return;
    }

    // Guest path: store locally without hitting API
    if (!isAuthenticated) {
      addGuestWishlistItem(product, selectedVariant?.id);
      setJustAddedToWishlist(true);
      toast.success("Added to wishlist");
      return;
    }

    // Authenticated path: make API call
    addToWishlist.mutate({
      data: {
        productId: product.id,
        variantId: selectedVariant?.id,
      },
    });
    setJustAddedToWishlist(true);
  };

  // Reset justAddedToWishlist when variant changes
  useEffect(() => {
    setJustAddedToWishlist(false);
  }, [selectedVariant?.id, product?.id]);

  // Check if current product/variant is in wishlist
  const isCurrentItemInWishlist = useMemo(() => {
    if (!product?.id) return false;

    // If we just added it to wishlist, show filled state
    if (justAddedToWishlist) return true;

    // For authenticated users, we can't easily check without API call
    // But we show filled state after successful addition
    if (isAuthenticated) {
      return false; // Could be improved with a wishlist query in future
    }

    // For guest users, check the store
    return isInWishlist(product.id, selectedVariant?.id);
  }, [
    product?.id,
    selectedVariant?.id,
    isAuthenticated,
    isInWishlist,
    justAddedToWishlist,
  ]);
  const handleShare = (name: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/products/${product?.id}`);
    toast.success(`Link to ${name} copied to clipboard`);
  };
  // --- top-level error states ---
  if (isError)
    return <div className="p-8 text-center">Error loading product</div>;
  if (!product && !isLoading)
    return <div className="p-8 text-center">Product not found</div>;



  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-muted-foreground gap-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          <span>/</span>

          <button
            onClick={() => navigate(breadcrumbCategory.path)}
            className="hover:text-primary transition-colors"
          >
            {breadcrumbCategory.label}
          </button>

          <span>/</span>

          <span className="text-foreground font-medium">{product?.name}</span>
        </div>

        {/* Loading */}
        {isLoading && <LoadingState label="Loading product…" />}

        {/* API error inside page */}
        {isError && !isLoading && (
          <div className="text-center py-16 space-y-4">
            <p className="text-destructive">
              {(error as any)?.message || "Failed to load product"}
            </p>
          </div>
        )}

        {/* Main Layout */}
        {!isLoading && product && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* IMAGE GALLERY */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border relative">
                {images.length > 0 && (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}

                {product.status !== "IN_STOCK" && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline">{product.status}</Badge>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square rounded-lg overflow-hidden border transition ${
                        selectedImage === i
                          ? "border-primary"
                          : "border-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div className="flex flex-col">
              <p className="text-sm font-medium text-primary uppercase mb-2">
                {breadcrumbCategory.label}
              </p>

              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-2xl font-bold text-foreground">
                  {fmt(currentPrice)}
                </span>
              </div>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="mb-8 space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Select Variant
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-lg border cursor-pointer text-sm transition ${
                          selectedVariant?.id === v.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {v.name}
                        {v.extraPrice !== 0 && (
                          <span className="ml-1 opacity-70">
                            (+{fmt(v.extraPrice / 100)})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to cart + buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4 pb-8 border-b border-border">
                <Button
                  size="lg"
                  className="w-1/2"
                  disabled={
                    product.status !== "IN_STOCK" || addToCart.isPending
                  }
                  onClick={handleAddToCart}
                >
                  {addToCart.isPending
                    ? "Adding..."
                    : product.status === "IN_STOCK"
                    ? "Add to Cart"
                    : product.status}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant={isCurrentItemInWishlist ? "default" : "outline"}
                    size="lg"
                    className={`px-4 transition-all duration-200 ease-in-out ${
                      isCurrentItemInWishlist
                        ? "bg-muted hover:bg-muted text-secondary shadow-md hover:shadow-lg"
                        : "hover:bg-muted hover:border-muted"
                    }`}
                    onClick={handleAddToWishlist}
                    disabled={addToWishlist.isPending}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all duration-200 ${
                        isCurrentItemInWishlist
                          ? "fill-primary scale-110"
                          : "hover:scale-110 hover:text-muted"
                      }`}
                    />
                  </Button>

                  <Button variant="outline" size="lg" className="px-4" onClick={() => handleShare(product.name)}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {addError && (
                <p className="text-sm text-destructive mb-6">{addError}</p>
              )}

              {/* Perks */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="w-5 h-5 text-primary" />
                  Free Shipping over 1000 INR
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="w-5 h-5 text-primary" />1 Year
                  Warranty
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="specs">Specs</TabsTrigger>
                  <TabsTrigger value="sound">Sound</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="overview"
                  className="mt-4 text-muted-foreground"
                >
                  <p>{product.description}</p>
                </TabsContent>

                <TabsContent
                  value="specs"
                  className="mt-4 text-muted-foreground"
                >
                  <div className="space-y-6">
                    {renderSpecBlock(
                      "Keyboard Specifications",
                      product.keyboardSpec
                    )}
                    {renderSpecBlock(
                      "Switch Specifications",
                      product.switchSpec
                    )}

                    {!product.keyboardSpec && !product.switchSpec && (
                      <p>No technical specs available.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="sound" className="mt-4">
                  <div className="text-muted-foreground text-center py-6">
                    {soundTests.length > 0 ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-full max-w-2xl mx-auto">
                          {(() => {
                            const videoId = extractYouTubeVideoId(soundTests[0]);
                            return videoId ? (
                              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  title="Sound Test Video"
                                  className="absolute inset-0 w-full h-full rounded-lg"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Youtube className="w-8 h-8" />
                                <a
                                  href={soundTests[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-medium"
                                >
                                  Watch Sound Test Video
                                </a>
                              </div>
                            );
                          })()}
                        </div>
                        {soundTests.length > 1 && (
                          <p className="text-sm text-muted-foreground">
                            {soundTests.length - 1} more video{soundTests.length > 2 ? 's' : ''} available
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <p>No sound tests available.</p>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
