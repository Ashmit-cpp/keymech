import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCartControllerGetCartQueryKey,
  type ProductResponseDto,
  type ProductVariantResponseDto,
  useCartControllerAddItem,
  useProductsControllerFindOneBySlug,
} from "@/api/generated";
import { KEYCAP_TEXTURES } from "@/lib/constants";
import { parseJsonish } from "@/lib/garage";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestCartStore } from "@/stores/cart-store";

const SPECTER_SLUG = "specter-75";

type TextureId = (typeof KEYCAP_TEXTURES)[number]["id"];

function variantTextureId(variant: ProductVariantResponseDto): string | null {
  const parsed = parseJsonish(variant.specs);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const textureId = (parsed as Record<string, unknown>).textureId;
  return typeof textureId === "string" ? textureId : null;
}

export function useSpecterCommerce(selectedTextureId: TextureId) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addGuestItem = useGuestCartStore((state) => state.addItem);
  const productQuery = useProductsControllerFindOneBySlug(SPECTER_SLUG);
  const addItem = useCartControllerAddItem();

  const product = productQuery.data?.data as ProductResponseDto | undefined;
  const selectedVariant = useMemo(
    () =>
      product?.variants.find(
        (variant) => variantTextureId(variant) === selectedTextureId,
      ) ?? product?.variants[0],
    [product, selectedTextureId],
  );

  const requireProduct = useCallback(() => {
    if (!product || !selectedVariant || product.status !== "IN_STOCK") {
      toast.error("Specter 75 is temporarily unavailable. Please try again.");
      return null;
    }
    return { product, selectedVariant };
  }, [product, selectedVariant]);

  const addSelectedToCart = useCallback(async () => {
    const selection = requireProduct();
    if (!selection || addItem.status === "pending") return false;

    try {
      if (isAuthenticated) {
        await addItem.mutateAsync({
          data: {
            productId: selection.product.id,
            variantId: selection.selectedVariant.id,
            quantity: 1,
          },
        });
        await queryClient.invalidateQueries({
          queryKey: getCartControllerGetCartQueryKey(),
        });
      } else {
        addGuestItem(
          selection.product as Parameters<typeof addGuestItem>[0],
          selection.selectedVariant.id,
          1,
        );
      }

      toast.success(`${selection.selectedVariant.name} added to cart`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add Specter 75");
      return false;
    }
  }, [addGuestItem, addItem, isAuthenticated, queryClient, requireProduct]);

  const buyNow = useCallback(async () => {
    if (await addSelectedToCart()) navigate("/checkout");
  }, [addSelectedToCart, navigate]);

  const viewDetails = useCallback(() => {
    if (!product) {
      toast.error("Specter 75 details are temporarily unavailable.");
      return;
    }
    const texture = KEYCAP_TEXTURES.find((item) => item.id === selectedTextureId);
    const suffix = texture ? `?colorway=${texture.colorwayId}` : "";
    navigate(`/products/${product.id}${suffix}`);
  }, [navigate, product, selectedTextureId]);

  const customizeInGarage = useCallback(() => {
    const texture = KEYCAP_TEXTURES.find((item) => item.id === selectedTextureId);
    if (!texture) return;
    navigate(
      `/garage?featured=${SPECTER_SLUG}&colorway=${texture.colorwayId}`,
    );
  }, [navigate, selectedTextureId]);

  return {
    product,
    selectedVariant,
    isLoading: productQuery.isLoading,
    isError: productQuery.isError,
    isAdding: addItem.status === "pending",
    addSelectedToCart,
    buyNow,
    viewDetails,
    customizeInGarage,
  };
}
