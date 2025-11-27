import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js';
import pg from 'pg'
import * as bcrypt from 'bcrypt'

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user1 = await prisma.user.create({
    data: {
      email: 'admin@keymech.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'user@keymech.com',
      password: hashedPassword,
      name: 'Regular User',
      role: 'USER',
    },
  })

  console.log('✅ Users created')

  // Create Keyboard Products
  const keyboard1 = await prisma.product.create({
    data: {
      name: 'Keychron Q1 Pro',
      slug: 'keychron-q1-pro',
      description: 'A premium 75% gasket-mounted mechanical keyboard with hot-swappable switches and wireless connectivity.',
      price: 18900, // $189.00
      category: 'KEYBOARD',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://example.com/q1-pro-1.jpg',
        'https://example.com/q1-pro-2.jpg',
      ]),
      soundTests: JSON.stringify([
        'https://youtube.com/q1-pro-sound-test',
      ]),
      keyboardSpec: {
        create: {
          layout: 'P75',
          mountingStyle: 'GASKET',
          caseMaterial: 'ALUMINUM',
          rgbOrientation: 'SOUTH',
          hotSwap: true,
          switchCompatibility: 'BOTH',
          connectivity: JSON.stringify(['WIRED', 'WIRELESS', 'BLUETOOTH']),
          plateMaterial: 'STEEL',
          plateMountIncluded: true,
          stabilizerType: 'SCREW_IN',
          weightGrams: 1800,
          firmware: 'QMK/VIA',
          isoAnsi: 'ANSI',
          notes: 'Includes foam dampening and programmable RGB',
        },
      },
      variants: {
        create: [
          {
            name: 'Carbon Black - Knob',
            sku: 'Q1PRO-BLK-KNOB',
            extraPrice: 0,
            specs: JSON.stringify({ color: 'Carbon Black', knob: true }),
          },
          {
            name: 'Shell White - Knob',
            sku: 'Q1PRO-WHT-KNOB',
            extraPrice: 1000, // +$10
            specs: JSON.stringify({ color: 'Shell White', knob: true }),
          },
        ],
      },
    },
  })

  const keyboard2 = await prisma.product.create({
    data: {
      name: 'Tofu60 Redux',
      slug: 'tofu60-redux',
      description: 'Classic 60% aluminum keyboard with tray mount design, perfect for budget custom builds.',
      price: 8900, // $89.00
      category: 'KEYBOARD',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://example.com/tofu60-1.jpg',
      ]),
      keyboardSpec: {
        create: {
          layout: 'P60',
          mountingStyle: 'TRAY',
          caseMaterial: 'ALUMINUM',
          rgbOrientation: 'NONE',
          hotSwap: true,
          switchCompatibility: 'FIVE_PIN',
          connectivity: JSON.stringify(['WIRED']),
          plateMaterial: 'BRASS',
          plateMountIncluded: true,
          stabilizerType: 'PCB_MOUNT',
          weightGrams: 950,
          firmware: 'QMK',
          isoAnsi: 'ANSI',
        },
      },
      variants: {
        create: [
          {
            name: 'Black - Hotswap PCB',
            sku: 'TOFU60-BLK-HS',
            extraPrice: 0,
          },
          {
            name: 'Silver - Hotswap PCB',
            sku: 'TOFU60-SLV-HS',
            extraPrice: 500,
          },
        ],
      },
    },
  })

  const aliceKeyboard = await prisma.product.create({
    data: {
      name: 'Arisu Pro',
      slug: 'arisu-pro',
      description: 'Ergonomic Alice-layout keyboard with split design for comfortable typing.',
      price: 24900,
      category: 'KEYBOARD',
      status: 'PREORDER',
      images: JSON.stringify(['https://example.com/arisu-1.jpg']),
      keyboardSpec: {
        create: {
          layout: 'ALICE',
          mountingStyle: 'GASKET',
          caseMaterial: 'ALUMINUM',
          rgbOrientation: 'SOUTH',
          hotSwap: true,
          switchCompatibility: 'BOTH',
          connectivity: JSON.stringify(['WIRED', 'BLUETOOTH']),
          plateMaterial: 'PC',
          plateMountIncluded: true,
          stabilizerType: 'SCREW_IN',
          weightGrams: 1600,
          firmware: 'VIA',
          isoAnsi: 'ANSI',
        },
      },
    },
  })

  console.log('✅ Keyboards created')

  // Create Switch Products
  const switch1 = await prisma.product.create({
    data: {
      name: 'Cherry MX Black',
      slug: 'cherry-mx-black',
      description: 'Classic linear switch with smooth keystrokes. The gold standard for gaming.',
      price: 90, // $0.90 per switch
      category: 'SWITCH',
      status: 'IN_STOCK',
      images: JSON.stringify(['https://example.com/cherry-black.jpg']),
      switchSpec: {
        create: {
          switchType: 'LINEAR',
          stemMaterial: 'POM',
          topHousing: 'Nylon',
          bottomHousing: 'Nylon',
          springWeight: 60,
          preTravel: 2.0,
          totalTravel: 4.0,
          lubed: false,
          soundProfile: 'Deep, smooth',
          pins: '5-pin',
        },
      },
      variants: {
        create: [
          {
            name: '10 Pack',
            sku: 'CHERRY-BLK-10',
            extraPrice: 0,
          },
          {
            name: '90 Pack',
            sku: 'CHERRY-BLK-90',
            extraPrice: 7000, // bulk discount
          },
        ],
      },
    },
  })

  const switch2 = await prisma.product.create({
    data: {
      name: 'Gateron Oil King',
      slug: 'gateron-oil-king',
      description: 'Factory pre-lubed linear switch with deep, thocky sound. Buttery smooth.',
      price: 85,
      category: 'SWITCH',
      status: 'IN_STOCK',
      images: JSON.stringify(['https://example.com/oil-king.jpg']),
      soundTests: JSON.stringify(['https://youtube.com/oil-king-sound']),
      switchSpec: {
        create: {
          switchType: 'LINEAR',
          stemMaterial: 'POM',
          topHousing: 'Nylon PA66',
          bottomHousing: 'Nylon PA66',
          springWeight: 55,
          preTravel: 2.0,
          totalTravel: 4.0,
          lubed: true,
          soundProfile: 'Thocky, deep',
          pins: '5-pin',
        },
      },
    },
  })

  const switch3 = await prisma.product.create({
    data: {
      name: 'Boba U4T',
      slug: 'boba-u4t',
      description: 'Sharp tactile switch with strong bump. Favorite among tactile enthusiasts.',
      price: 75,
      category: 'SWITCH',
      status: 'IN_STOCK',
      switchSpec: {
        create: {
          switchType: 'TACTILE',
          stemMaterial: 'POM',
          topHousing: 'Polycarbonate',
          bottomHousing: 'Nylon',
          springWeight: 62,
          preTravel: 2.0,
          totalTravel: 3.8,
          lubed: false,
          soundProfile: 'Thocky tactile',
          pins: '5-pin',
        },
      },
    },
  })

  console.log('✅ Switches created')

  // Create Keycap Sets
  const keycap1 = await prisma.product.create({
    data: {
      name: 'GMK Olivia++',
      slug: 'gmk-olivia-plus-plus',
      description: 'Iconic pink and cream colorway. Double-shot ABS with Cherry profile.',
      price: 14900,
      category: 'KEYCAP',
      status: 'GROUP_BUY',
      images: JSON.stringify([
        'https://example.com/olivia-1.jpg',
        'https://example.com/olivia-2.jpg',
      ]),
      keycapSpec: {
        create: {
          profile: 'CHERRY',
          material: 'ABS',
          thickness: 1.4,
          legends: 'Double-shot',
          rowSupport: true,
          notes: 'Includes base kit, spacebars, and novelties',
        },
      },
      variants: {
        create: [
          {
            name: 'Base Kit',
            sku: 'GMK-OLIVIA-BASE',
            extraPrice: 0,
          },
          {
            name: 'Extension Kit',
            sku: 'GMK-OLIVIA-EXT',
            extraPrice: 4900,
          },
        ],
      },
    },
  })

  const keycap2 = await prisma.product.create({
    data: {
      name: 'DROP + BIIP MT3 Extended 2048',
      slug: 'mt3-extended-2048',
      description: 'Retro-futuristic keycap set with high-sculpt MT3 profile. PBT construction.',
      price: 11900,
      category: 'KEYCAP',
      status: 'IN_STOCK',
      images: JSON.stringify(['https://example.com/mt3-2048.jpg']),
      keycapSpec: {
        create: {
          profile: 'SA',
          material: 'PBT',
          thickness: 1.5,
          legends: 'Dye-sublimation',
          rowSupport: true,
          notes: 'High-profile sculpted keycaps',
        },
      },
    },
  })

  console.log('✅ Keycaps created')

  // Create Accessory Products
  const stabilizer = await prisma.product.create({
    data: {
      name: 'Durock V2 Stabilizers',
      slug: 'durock-v2-stabilizers',
      description: 'Premium screw-in stabilizers with gold-plated wires. Smooth and rattle-free.',
      price: 2400,
      category: 'STABILIZER',
      status: 'IN_STOCK',
      images: JSON.stringify(['https://example.com/durock-stabs.jpg']),
    },
  })

  const plate = await prisma.product.create({
    data: {
      name: 'FR4 Plate - 60%',
      slug: 'fr4-plate-60',
      description: 'Flexible FR4 material plate for 60% keyboards. Softer typing feel.',
      price: 1800,
      category: 'PLATE',
      status: 'IN_STOCK',
    },
  })

  const coiledCable = await prisma.product.create({
    data: {
      name: 'Custom Coiled Cable',
      slug: 'custom-coiled-cable',
      description: 'Handmade aviator cable with custom colors. USB-C to USB-A.',
      price: 4900,
      category: 'ACCESSORY',
      status: 'IN_STOCK',
      images: JSON.stringify(['https://example.com/cable.jpg']),
      variants: {
        create: [
          {
            name: 'Black/Gold',
            sku: 'CABLE-BLK-GLD',
            extraPrice: 0,
          },
          {
            name: 'White/Silver',
            sku: 'CABLE-WHT-SLV',
            extraPrice: 500,
          },
        ],
      },
    },
  })

  console.log('✅ Accessories created')

  // Create Inventory for products
  await prisma.inventory.create({
    data: {
      productId: keyboard1.id,
      stock: 25,
    },
  })

  await prisma.inventory.create({
    data: {
      productId: keyboard2.id,
      stock: 40,
    },
  })

  await prisma.inventory.create({
    data: {
      productId: switch1.id,
      stock: 5000,
    },
  })

  await prisma.inventory.create({
    data: {
      productId: switch2.id,
      stock: 3000,
    },
  })

  await prisma.inventory.create({
    data: {
      productId: keycap1.id,
      stock: 0, // Group buy
    },
  })

  await prisma.inventory.create({
    data: {
      productId: stabilizer.id,
      stock: 150,
    },
  })

  console.log('✅ Inventory created')

  // Create a sample cart for user2
  const cart = await prisma.cart.create({
    data: {
      userId: user2.id,
      items: {
        create: [
          {
            productId: keyboard2.id,
            quantity: 1,
          },
          {
            productId: switch2.id,
            quantity: 90,
          },
          {
            productId: stabilizer.id,
            quantity: 1,
          },
        ],
      },
    },
  })

  console.log('✅ Cart created')

  // Create a sample order
  const order = await prisma.order.create({
    data: {
      userId: user2.id,
      status: 'COMPLETED',
      totalAmount: 21400, // keyboard + switches
      items: {
        create: [
          {
            productId: keyboard1.id,
            quantity: 1,
            price: 18900,
          },
          {
            productId: coiledCable.id,
            quantity: 1,
            price: 4900,
          },
        ],
      },
    },
  })

  console.log('✅ Order created')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })