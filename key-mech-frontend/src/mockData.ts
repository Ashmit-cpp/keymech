
export type ProductStatus = 'IN_STOCK' | 'GROUP_BUY' | 'PREORDER';
export type Layout = '60%' | '65%' | '75%' | 'TKL' | 'FULL_SIZE' | 'ALICE';
export type SwitchType = 'LINEAR' | 'TACTILE' | 'CLICKY';
export type KeycapProfile = 'CHERRY' | 'SA' | 'OEM' | 'XDA' | 'MT3';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  extraPrice: number; // cents
  images?: string[];
  specs?: Record<string, any>;
}

export interface KeyboardSpec {
  layout: Layout;
  mountingStyle: string;
  caseMaterial: string;
  hotSwap: boolean;
  plateMaterial?: string;
  angle?: number;
  pcb?: string;
}

export interface SwitchSpec {
  switchType: SwitchType;
  actuationForce?: number; // grams
  preTravel?: number; // mm
  totalTravel?: number; // mm
  stemMaterial?: string;
  housing?: string;
  factoryLube?: boolean;
}

export interface KeycapSpec {
  profile: KeycapProfile;
  material: string; // PBT/ABS
  legends: string; // Double-shot, Dye-sub
  thickness?: number; // mm
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number; // cents
  originalPrice?: number; // cents
  category: Category;
  status: ProductStatus;
  images: string[];
  rating: number;
  reviewCount: number;
  
  // Specific Specs (One of these is usually populated based on category)
  keyboardSpec?: KeyboardSpec;
  switchSpec?: SwitchSpec;
  keycapSpec?: KeycapSpec;
  
  variants: ProductVariant[];
  
  // Group Buy specific data
  groupBuy?: {
    endDate: string;
    currentUnits: number;
    targetUnits: number;
  };

  soundTests?: {
    title: string;
    url: string; // YouTube ID or Audio URL
    type: 'video' | 'audio';
  }[];
  
  isNew?: boolean;
}

export interface Build {
  id: string;
  name: string;
  image: string;
  components: {
    keyboard: string;
    switches: string;
    keycaps: string;
  };
  builder: string;
}

export interface Testimonial {
  id: string;
  user: string;
  avatar: string;
  text: string;
  rating: number;
}



export const categories: Category[] = [
  { id: '1', name: 'Keyboards', slug: 'keyboards', image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800', productCount: 42 },
  { id: '2', name: 'Switches', slug: 'switches', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800', productCount: 156 },
  { id: '3', name: 'Keycaps', slug: 'keycaps', image: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=800', productCount: 89 },
  { id: '4', name: 'Deskmats', slug: 'deskmats', image: 'https://images.unsplash.com/photo-1629814493406-7e23ae2c4012?auto=format&fit=crop&q=80&w=800', productCount: 34 },
  { id: '5', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1563191911-e65f8655ebf9?auto=format&fit=crop&q=80&w=800', productCount: 67 },
  { id: '6', name: 'Artisans', slug: 'artisans', image: 'https://images.unsplash.com/photo-1627993416805-5925f483c6b2?auto=format&fit=crop&q=80&w=800', productCount: 12 },
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Specter 75 Premium',
    slug: 'specter-75-premium',
    description: "The Specter 75 is our flagship 75% keyboard, featuring a fully CNC-machined aluminum case, gasket mounting system for a flexible typing experience, and a stunning PVD weight. Designed for the enthusiast who refuses to compromise.",
    price: 34900, // cents
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1626218174397-5780d006be91?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1613251783967-7679058b8d4e?auto=format&fit=crop&q=80&w=1200'
    ],
    category: categories[0],
    status: 'IN_STOCK',
    keyboardSpec: {
      layout: '75%',
      mountingStyle: 'Gasket Mount',
      caseMaterial: '6063 Aluminum',
      hotSwap: true,
      plateMaterial: 'Polycarbonate',
      angle: 6.5,
      pcb: '1.2mm Flex Cut'
    },
    variants: [
      { id: 'v1', name: 'Black', extraPrice: 0 },
      { id: 'v2', name: 'E-White', extraPrice: 2000 },
      { id: 'v3', name: 'Navy Blue', extraPrice: 0 }
    ],
    rating: 4.9,
    reviewCount: 124,
    isNew: false,
    soundTests: [
        { type: 'video', title: 'Taeha Types Build Stream', url: '#' },
        { type: 'audio', title: 'Stock Config (Linear)', url: '#' }
    ]
  },
  {
    id: 'p2',
    name: 'Nebula Switches (10x)',
    slug: 'nebula-switches',
    description: "Nebula switches are linear switches with a long pole stem for a solid bottom-out sound. Factory lubed for smoothness right out of the box. These feature a custom nylon housing blend for a deep, thocky sound signature.",
    price: 650,
    images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=1200'],
    category: categories[1],
    status: 'IN_STOCK',
    switchSpec: {
      switchType: 'LINEAR',
      actuationForce: 62,
      preTravel: 2.0,
      totalTravel: 3.5,
      stemMaterial: 'POM',
      factoryLube: true,
      housing: 'Custom Nylon Blend'
    },
    variants: [
        { id: 'v1', name: '62g', extraPrice: 0 },
        { id: 'v2', name: '67g', extraPrice: 0 }
    ],
    rating: 4.8,
    reviewCount: 890,
  },
  {
    id: 'p3',
    name: 'GMK Deep Space',
    slug: 'gmk-deep-space',
    description: "Explore the cosmos with GMK Deep Space. Inspired by interstellar travel, this set features a deep purple and grey colorway with cyan accents. Produced by GMK in Germany with their legendary double-shot ABS molding.",
    price: 18500,
    originalPrice: 20000,
    images: ['https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=1200'],
    category: categories[2],
    status: 'GROUP_BUY',
    keycapSpec: {
      profile: 'CHERRY',
      material: 'ABS',
      legends: 'Double-shot',
      thickness: 1.5
    },
    variants: [
        { id: 'v1', name: 'Base Kit', extraPrice: 0 },
        { id: 'v2', name: 'Novelties', extraPrice: -12000 }, // Cheaper than base
        { id: 'v3', name: 'Spacebars', extraPrice: -15000 }
    ],
    rating: 5.0,
    reviewCount: 12,
    groupBuy: {
      endDate: '2023-12-31',
      currentUnits: 450,
      targetUnits: 1000
    }
  },
  {
    id: 'p4',
    name: 'Phantom 65 Kit',
    slug: 'phantom-65-kit',
    description: "The Phantom 65 is an entry-level enthusiast kit made from injection molded Polycarbonate. It offers incredible RGB diffusion and a poppy sound profile. Perfect for your first custom build.",
    price: 19900,
    images: ['https://images.unsplash.com/photo-1595225476361-9486c8f9df0f?auto=format&fit=crop&q=80&w=1200'],
    category: categories[0],
    status: 'PREORDER',
    keyboardSpec: {
      layout: '65%',
      mountingStyle: 'Tray Mount',
      caseMaterial: 'Frosted Polycarbonate',
      hotSwap: true,
      plateMaterial: 'Aluminum',
      angle: 7.0
    },
    variants: [
        { id: 'v1', name: 'Frosted Clear', extraPrice: 0 },
        { id: 'v2', name: 'Smoke Black', extraPrice: 0 }
    ],
    rating: 4.7,
    reviewCount: 45,
    isNew: true,
  },
  {
    id: 'p5',
    name: 'Tactile Holy Pandas',
    slug: 'holy-pandas',
    description: "The legend returns. Holy Pandas are known for their distinct tactile bump and loud, clacky sound. These are a must-try for any tactile switch lover.",
    price: 800,
    images: ['https://images.unsplash.com/photo-1627993416805-5925f483c6b2?auto=format&fit=crop&q=80&w=1200'],
    category: categories[1],
    status: 'IN_STOCK',
    switchSpec: {
        switchType: 'TACTILE',
        actuationForce: 67,
        preTravel: 2.0,
        totalTravel: 4.0,
        stemMaterial: 'POM',
        factoryLube: false
    },
    variants: [],
    rating: 4.9,
    reviewCount: 2045,
  },
  {
    id: 'p6',
    name: 'Coiled Aviator Cable',
    slug: 'coiled-cable-white',
    description: "Finish your setup with a premium coiled cable. Double-sleeved with Techflex and Paracord, featuring a heavy-duty aviator connector. USB-C to USB-A.",
    price: 4500,
    images: ['https://images.unsplash.com/photo-1563191911-e65f8655ebf9?auto=format&fit=crop&q=80&w=1200'],
    category: categories[4],
    status: 'IN_STOCK',
    variants: [
        { id: 'v1', name: 'White', extraPrice: 0 },
        { id: 'v2', name: 'Black', extraPrice: 0 },
        { id: 'v3', name: 'Rainbow', extraPrice: 500 }
    ],
    rating: 4.6,
    reviewCount: 320,
    isNew: true,
  }
];

export const builds: Build[] = [
  {
    id: 'b1',
    name: 'Cyberpunk Night City',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b91dd55?auto=format&fit=crop&q=80&w=800',
    components: {
      keyboard: 'Specter 75',
      switches: 'Nebula Linear',
      keycaps: 'GMK Laser'
    },
    builder: 'mech_fanatic_99'
  },
  {
    id: 'b2',
    name: 'Minimalist White',
    image: 'https://images.unsplash.com/photo-1595225476361-9486c8f9df0f?auto=format&fit=crop&q=80&w=800',
    components: {
      keyboard: 'Snow 65',
      switches: 'Boba U4T',
      keycaps: 'ePBT GOK'
    },
    builder: 'clean_setup_daily'
  },
  {
    id: 'b3',
    name: 'Nature Wood Tofu',
    image: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&q=80&w=800',
    components: {
      keyboard: 'Tofu60 Walnut',
      switches: 'Gateron Oil Kings',
      keycaps: 'GMK Camping'
    },
    builder: 'woodworks_keebs'
  }
];

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    user: 'Alex Chen',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    text: "The build quality of the Specter 75 is unmatched. KeyMech's shipping was incredibly fast, too.",
    rating: 5
  },
  {
    id: 't2',
    user: 'Sarah Miller',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    text: "Finally found a place that stocks real enthusiast components. The group buy process was transparent and easy.",
    rating: 5
  },
  {
    id: 't3',
    user: 'Jordan Smith',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    text: "Best customer service I've experienced in the hobby. They helped me pick the perfect switches.",
    rating: 4.5
  }
];
