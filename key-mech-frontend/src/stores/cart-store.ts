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

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

interface GuestCartState {
  items: CartItem[];
  addItem: (product: Product, variantId?: string, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getItems: () => CartItem[];
}

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, variantId, quantity = 1) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === product.id && i.variantId === variantId
          );

          if (existingIndex >= 0) {
            // Update quantity if item exists
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            return { items: newItems };
          } else {
            // Add new item with full product data
            const variant = variantId ? product.variants.find(v => v.id === variantId) : undefined;
            const newItem: CartItem = {
              productId: product.id,
              variantId,
              quantity,
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

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            // Remove if quantity is 0 or less
            return {
              items: state.items.filter(
                (item) => !(item.productId === productId && item.variantId === variantId)
              ),
            };
          }

          const newItems = state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          );
          return { items: newItems };
        }),

      clearCart: () => set({ items: [] }),
      
      getItems: () => get().items,
    }),
    {
      name: 'guest-cart-storage',
    }
  )
);
