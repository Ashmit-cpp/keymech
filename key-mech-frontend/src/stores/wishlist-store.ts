import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProductVariant {
  id: string;
  productId: string;
  sku?: string;
  name: string;
  extraPrice: number;
  images?: any;
  specs?: any;
}

interface KeyboardSpec {
  id: string;
  productId: string;
  layout: string;
  mountingStyle: string;
  caseMaterial: string;
  rgbOrientation: string;
  hotSwap: boolean;
  switchCompatibility: string;
  connectivity?: any;
  plateMaterial?: string;
  plateMountIncluded: boolean;
  stabilizerType?: string;
  weightGrams?: number;
  firmware?: string;
  isoAnsi?: string;
  notes?: string;
}

interface SwitchSpec {
  id: string;
  productId: string;
  switchType: string;
  stemMaterial?: string;
  topHousing?: string;
  bottomHousing?: string;
  springWeight?: number;
  preTravel?: number;
  totalTravel?: number;
  lubed?: boolean;
  soundProfile?: string;
  pins?: string;
}

interface KeycapSpec {
  id: string;
  productId: string;
  profile: string;
  material: string;
  thickness?: number;
  legends?: string;
  rowSupport?: boolean;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category: string;
  status?: string;
  images?: any;
  gallery?: any;
  soundTests?: any;
  explodedView?: string;
  technicalSpec?: string;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  keyboardSpec?: KeyboardSpec;
  switchSpec?: SwitchSpec;
  keycapSpec?: KeycapSpec;
}

interface WishlistItem {
  productId: string;
  variantId?: string;
  product: Product;
  variant?: ProductVariant;
}

interface GuestWishlistState {
  items: WishlistItem[];
  addItem: (product: Product, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clearWishlist: () => void;
  getItems: () => WishlistItem[];
  getMergeItems: () => { productId?: string; variantId?: string }[];
  isInWishlist: (productId: string, variantId?: string) => boolean;
}

export const useGuestWishlistStore = create<GuestWishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variantId) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === product.id && i.variantId === variantId
          );

          if (existingIndex >= 0) {
            // Item already exists, don't add duplicate
            return state;
          } else {
            // Add new item with full product data
            const variant = variantId ? product.variants.find(v => v.id === variantId) : undefined;
            const newItem: WishlistItem = {
              productId: product.id,
              variantId,
              product,
              variant,
            };
            return { items: [...state.items, newItem] };
          }
        }),

      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        })),

      clearWishlist: () => set({ items: [] }),

      getItems: () => get().items,

      getMergeItems: () => get().items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
      })),

      isInWishlist: (productId, variantId) =>
        get().items.some(
          (item) => item.productId === productId && item.variantId === variantId
        ),
    }),
    {
      name: 'guest-wishlist-storage',
    }
  )
);