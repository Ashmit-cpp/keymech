import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // const user1 = await prisma.user.create({
  //   data: {
  //     email: 'admin@keymech.com',
  //     password: hashedPassword,
  //     name: 'Admin User',
  //     role: 'ADMIN',
  //   },
  // })

  // const user2 = await prisma.user.create({
  //   data: {
  //     email: 'user@keymech.com',
  //     password: hashedPassword,
  //     name: 'Regular User',
  //     role: 'USER',
  //   },
  // })

  // console.log('✅ Users created')

  // Create Keyboard Products
  const keyboard1 = await prisma.product.create({
    data: {
      name: 'Keychron Q1 Pro',
      slug: 'keychron-q1-pro',
      description:
        'A premium 75% gasket-mounted mechanical keyboard with hot-swappable switches and wireless connectivity.',
      price: 1699900,
      category: 'KEYBOARD',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://siliconz.vn/cdn/shop/files/keychron-q1-pro-2.jpg?v=1719914487&width=1445',
        'https://m.media-amazon.com/images/I/81Hj2zvzwhL._SL1500_.jpg',
      ]),
      soundTests: JSON.stringify([
        'https://www.youtube.com/watch?v=E-kqnenvUYw',
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
  });

  const keyboard2 = await prisma.product.create({
    data: {
      name: 'Tofu60 Redux',
      slug: 'tofu60-redux',
      description:
        'Classic 60% aluminum keyboard with tray mount design, perfect for budget custom builds.',
      price: 1299900, // $89.00
      category: 'KEYBOARD',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://mechboards.co.uk/cdn/shop/products/kbdfans-tofu-60-redux-caseakbdpt0116521-906214.jpg?v=1689144092',
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
  });

  const keychronQ1Max = await prisma.product.create({
    data: {
      name: 'Keychron Q1 Max',
      slug: 'keychron-q1-max',
      description:
        'Premium 75% custom mechanical keyboard with full-metal case, hot-swappable switches, 2.4 GHz/Bluetooth/wired connectivity, and south-facing RGB lighting.',
      price: 999900,
      category: 'KEYBOARD',
      status: 'AVAILABLE',
      images: JSON.stringify([
        'https://cdn.mwave.com.au/images/400/keychron_q1_max_hotswappable_rgb_wireless_keyboard_gateron_jupiter_brown_ac74124_54051.jpg',
        '/images/400/keychron_q1_max_hotswappable_rgb_wireless_keyboard_gateron_jupiter_brown_ac74124_54051.jpg',
        'https://computerlounge.co.nz/cdn/shop/files/fd05ddb75eb608bbeb190b2c9746f05718e2a09b_59632_2.jpg?v=1732149474&width=1214',
      ]),
      keyboardSpec: {
        create: {
          layout: 'P75',
          mountingStyle: 'GASKET',
          caseMaterial: 'ALUMINUM',
          rgbOrientation: 'SOUTH',
          hotSwap: true,
          switchCompatibility: 'BOTH',
          connectivity: JSON.stringify([
            'WIRED',
            'BLUETOOTH',
            'TWO_POINT_FOUR_GHZ',
          ]),
          plateMaterial: 'PC',
          plateMountIncluded: true,
          stabilizerType: 'SCREW_IN',
          weightGrams: 1724,
          firmware: 'QMK/VIA',
          isoAnsi: 'ANSI',
        },
      },
    },
  });

  const keyboardZoom75 = await prisma.product.create({
    data: {
      name: 'Zoom75 Essential Edition',
      slug: 'zoom75-essential-edition',
      description:
        'A highly customizable 75% gasket-mounted keyboard featuring a modular LCD, knob, or badge system and tri-mode connectivity.',
      price: 3150000, // ~$215.00
      category: 'KEYBOARD',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://meletrix.com/cdn/shop/files/Zoom75_Screen_SEBlack_AnoGold_39ebd02a-a873-4fd7-87d3-9f6ee1731e37.jpg?v=1715675675&width=1600',
        'https://meletrix.com/cdn/shop/files/Zoom75_Screen_EEStrawberryIcecream_eWhite.jpg?v=1715675675&width=1600',
        'https://meletrix.com/cdn/shop/files/Zoom75_Screen_SELavender_PVDSilver.jpg?v=1715675675&width=1600',
      ]),
      keyboardSpec: {
        create: {
          layout: 'P75',
          mountingStyle: 'GASKET',
          caseMaterial: 'ALUMINUM',
          rgbOrientation: 'SOUTH',
          hotSwap: true,
          switchCompatibility: 'FIVE_PIN',
          connectivity: JSON.stringify(['WIRED', 'BLUETOOTH', 'RADIO_2_4GHZ']),
          plateMaterial: 'PC',
          plateMountIncluded: true,
          stabilizerType: 'PCB_MOUNT',
          weightGrams: 1800,
          firmware: 'VIA',
          isoAnsi: 'ANSI',
        },
      },
      variants: {
        create: [
          {
            name: 'E-White - Tri-mode PCB',
            sku: 'ZOOM75-WHT-TRI',
            extraPrice: 0,
          },
          {
            name: 'Sky Blue - Tri-mode PCB',
            sku: 'ZOOM75-BLU-TRI',
            extraPrice: 0,
          },
          {
            name: 'Milky Green - Tri-mode PCB',
            sku: 'ZOOM75-GRN-TRI',
            extraPrice: 0,
          },
        ],
      },
    },
  });

  const keyboardQK75N = await prisma.product.create({
    data: {
      name: 'Qwertykeys QK75N',
      slug: 'qk75n',
      description:
        'The successor to the famous QK75. Features a mini-screen, rotary knob, and screw-less assembly for a clean look.',
      price: 3399900, // ~$230.00
      category: 'KEYBOARD',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://cdn.myportfolio.com/44c2fc27-a1ba-4d7f-80ab-886a492e5ba9/981febaa-b886-4acb-a8ab-ef79cdfeb7fa_rw_1920.jpg?h=6168a0a306a128cdb68b890bd8a1e87b',
      ]),
      soundTests: JSON.stringify(['http://youtube.com/watch?v=gLpnXCik4wY']),
      keyboardSpec: {
        create: {
          layout: 'P75',
          mountingStyle: 'GASKET',
          caseMaterial: 'ALUMINUM',
          rgbOrientation: 'SOUTH',
          hotSwap: true,
          switchCompatibility: 'FIVE_PIN',
          connectivity: JSON.stringify(['WIRED', 'BLUETOOTH', 'RADIO_2_4GHZ']),
          plateMaterial: 'BRASS',
          plateMountIncluded: true,
          stabilizerType: 'PCB_MOUNT',
          weightGrams: 1700,
          firmware: 'PROPRIETARY', // QK Config, though often QMK based logic
          isoAnsi: 'ANSI',
        },
      },
      variants: {
        create: [
          {
            name: 'Anodized Black - Circuit Badge',
            sku: 'QK75N-BLK-CIR',
            extraPrice: 0,
          },
          {
            name: 'E-Cream - Coffee Badge',
            sku: 'QK75N-CRM-COF',
            extraPrice: 150000,
          },
        ],
      },
    },
  });

  const keyboardNeo65 = await prisma.product.create({
    data: {
      name: 'Neo65',
      slug: 'neo65',
      description:
        'An ultra-minimalist 65% keyboard with a unibody aluminum case and dual mounting styles (O-ring and Gasket).',
      price: 1599900, // ~$110.00
      category: 'KEYBOARD',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://keebsforall.com/cdn/shop/collections/WechatIMG177.png?v=1697499305&width=2048',
      ]),
      soundTests: JSON.stringify([
        'https://www.youtube.com/watch?v=-dnZgl-aDcQ',
      ]),
      keyboardSpec: {
        create: {
          layout: 'P65',
          mountingStyle: 'TOP',
          caseMaterial: 'ALUMINUM',
          rgbOrientation: 'SOUTH',
          hotSwap: true,
          switchCompatibility: 'FIVE_PIN',
          connectivity: JSON.stringify(['WIRED', 'BLUETOOTH', 'RADIO_2_4GHZ']),
          plateMaterial: 'FR4',
          plateMountIncluded: true,
          stabilizerType: 'PCB_MOUNT',
          weightGrams: 980,
          firmware: 'QMK',
          isoAnsi: 'ANSI',
        },
      },
      variants: {
        create: [
          {
            name: 'Black - Gold Weight',
            sku: 'NEO65-BLK-GLD',
            extraPrice: 0,
          },
          {
            name: 'Silver - Silver Weight',
            sku: 'NEO65-SLV-SLV',
            extraPrice: 0,
          },
          {
            name: 'Purple - Chroma Weight',
            sku: 'NEO65-PUR-CHR',
            extraPrice: 200000,
          },
        ],
      },
    },
  });

  console.log('✅ Keyboards created');

  // Create Switch Products
  const switch1 = await prisma.product.create({
    data: {
      name: 'Cherry MX Black',
      slug: 'cherry-mx-black',
      description:
        'Classic linear switch with smooth keystrokes. The gold standard for gaming.',
      price: 90, // $0.90 per switch
      category: 'SWITCH',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://www.cherry.de/fileadmin/_processed_/6/9/csm_261369a4a2e65968f107542c09a0dacf_1e17c4bc47.jpg',
      ]),
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
  });

  const switch2 = await prisma.product.create({
    data: {
      name: 'Gateron Oil King',
      slug: 'gateron-oil-king',
      description:
        'Factory pre-lubed linear switch with deep, thocky sound. Buttery smooth.',
      price: 85,
      category: 'SWITCH',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://divinikey.com/cdn/shop/products/gateron-oil-king-linear-switches-389141.jpg?v=1642045846&width=640',
      ]),
      soundTests: JSON.stringify([
        'https://www.youtube.com/watch?v=-A_M_hvjVNY',
      ]),
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
  });

  const switch4 = await prisma.product.create({
    data: {
      name: 'Gateron Milky Yellow Pro',
      slug: 'gateron-milky-yellow-pro',
      description:
        'The best value switch in the hobby. Features a full "milky" housing that creates a deep, thocky sound signature.',
      price: 2500, // $0.25 per switch
      category: 'SWITCH',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://mks.blr1.cdn.digitaloceanspaces.com/uploads/2022/05/Gateron-Mechanical-Pro-Milky-Yellow-Switch-2-jpg.webp',
      ]),
      soundTests: JSON.stringify([
        'https://www.youtube.com/watch?v=HpDO6hMeFTI',
      ]),
      switchSpec: {
        create: {
          switchType: 'LINEAR',
          stemMaterial: 'POM',
          topHousing: 'Nylon PA66',
          bottomHousing: 'Nylon PA66',
          springWeight: 50, // Actuation force
          preTravel: 2.0,
          totalTravel: 4.0,
          lubed: true, // Factory lubed
          soundProfile: 'Deep, thocky',
          pins: '5-pin',
        },
      },
      variants: {
        create: [
          {
            name: '10 Pack',
            sku: 'MILKY-YEL-10',
            extraPrice: 0,
          },
          {
            name: '90 Pack',
            sku: 'MILKY-YEL-90',
            extraPrice: 1800, // Massive value for bulk
          },
        ],
      },
    },
  });
  const switch5 = await prisma.product.create({
    data: {
      name: 'HMX Xinhai',
      slug: 'hmx-xinhai',
      description:
        'A trendy "clacky" linear switch known for its bright sound profile, incredibly smooth travel, and top-tier factory lube.',
      price: 3500, // $0.35 per switch
      category: 'SWITCH',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://beaverkeys.ca/cdn/shop/files/2023-12-04-hc-studio-xinhai.png?v=1701734853&width=416',
      ]),
      soundTests: JSON.stringify([
        'https://www.youtube.com/watch?v=GMS1-x5h3Yc',
      ]),
      switchSpec: {
        create: {
          switchType: 'LINEAR',
          stemMaterial: 'POM',
          topHousing: 'PA12',
          bottomHousing: 'Modified Nylon',
          springWeight: 37, // Very light actuation
          preTravel: 2.0,
          totalTravel: 3.4, // Slightly shorter travel
          lubed: true,
          soundProfile: 'Bright, Clacky, Crisp',
          pins: '5-pin',
        },
      },
      variants: {
        create: [
          {
            name: '10 Pack',
            sku: 'HMX-XIN-10',
            extraPrice: 0,
          },
          {
            name: '90 Pack',
            sku: 'HMX-XIN-90',
            extraPrice: 2800,
          },
        ],
      },
    },
  });
  console.log('✅ Switches created');

  // Create Keycap Sets
  const keycap1 = await prisma.product.create({
    data: {
      name: 'GMK Olivia++',
      slug: 'gmk-olivia-plus-plus',
      description:
        'Iconic pink and cream colorway. Double-shot ABS with Cherry profile.',
      price: 14900,
      category: 'KEYCAP',
      status: 'GROUP_BUY',
      images: JSON.stringify([
        'https://dailyclack.com/cdn/shop/products/light_1800x.jpg?v=1575148921',
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
  });

  const keycap2 = await prisma.product.create({
    data: {
      name: 'DROP + BIIP MT3 Extended 2048',
      slug: 'mt3-extended-2048',
      description:
        'Retro-futuristic keycap set with high-sculpt MT3 profile. PBT construction.',
      price: 11900,
      category: 'KEYCAP',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://forum.devtalk.com/uploads/default/original/2X/9/9446a3d667fea342905ae0f991523a2b3f63b6ef.jpeg',
      ]),
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
  });
  const keycap3 = await prisma.product.create({
    data: {
      name: 'GMK Red Samurai',
      slug: 'gmk-red-samurai',
      description:
        'Legendary keycap set designed by RedSuns. Features deep red, black, and gold colors inspired by Japanese armor.',
      price: 94000, // ~$140.00 (GMK sets are premium)
      category: 'KEYCAP',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://m.media-amazon.com/images/I/61pUF1ax-nL.jpg',
      ]),
      keycapSpec: {
        create: {
          profile: 'CHERRY',
          material: 'ABS',
          thickness: 1.5,
          legends: 'Double-shot',
          rowSupport: true,
          notes: 'The gold standard for acoustics and crisp legends.',
        },
      },
    },
  });
  const keycap4 = await prisma.product.create({
    data: {
      name: 'Osume Matcha',
      slug: 'osume-matcha',
      description:
        'A serene, pastel green set inspired by matcha tea. Known for its clean, minimal novelty icons and "cozy" vibe.',
      price: 118500, // ~$85.00
      category: 'KEYCAP',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://osume.com/cdn/shop/files/MatchaKeycaps_ACR75.jpg?v=1756008210&width=900',
      ]),
      keycapSpec: {
        create: {
          profile: 'CHERRY', // Osume uses a slightly shorter Cherry profile
          material: 'PBT',
          thickness: 1.6,
          legends: 'Dye-sublimation',
          rowSupport: true,
          notes: 'Soft touch texture with high durability.',
        },
      },
    },
  });
  console.log('✅ Keycaps created');

  // Create Accessory Products
  const stabilizer = await prisma.product.create({
    data: {
      name: 'Durock V2 Stabilizers',
      slug: 'durock-v2-stabilizers',
      description:
        'Premium screw-in stabilizers with gold-plated wires. Smooth and rattle-free.',
      price: 2400,
      category: 'ACCESSORY',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://m.media-amazon.com/images/I/61CdAgqwhgL.jpg',
      ]),
    },
  });

  const plate = await prisma.product.create({
    data: {
      name: 'FR4 Plate - 60%',
      slug: 'fr4-plate-60',
      description:
        'Flexible FR4 material plate for 60% keyboards. Softer typing feel.',
      price: 1800,
      category: 'ACCESSORY',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://kbdfans.com/cdn/shop/products/FR4_e9aa9a90-30e2-40df-85c3-b81fe27d621f.jpg?v=1719556930',
      ]),
    },
  });

  const coiledCable = await prisma.product.create({
    data: {
      name: 'Custom Coiled Cable',
      slug: 'custom-coiled-cable',
      description: 'Handmade aviator cable with custom colors. USB-C to USB-A.',
      price: 4900,
      category: 'ACCESSORY',
      status: 'IN_STOCK',
      images: JSON.stringify([
        'https://m.media-amazon.com/images/I/81DtPlem4XL._AC_UF1000,1000_QL80_.jpg',
      ]),
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
  });

  console.log('✅ Accessories created');

  // Create Inventory for products
  await prisma.inventory.create({
    data: {
      productId: keyboard1.id,
      stock: 2500,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: keyboard2.id,
      stock: 4000,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: keychronQ1Max.id,
      stock: 1000,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: keyboardZoom75.id,
      stock: 1000,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: keyboardQK75N.id,
      stock: 1000,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: keyboardNeo65.id,
      stock: 1000,
    },
  });
  await prisma.inventory.create({
    data: {
      productId: switch1.id,
      stock: 5000,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: switch2.id,
      stock: 3000,
    },
  });
  await prisma.inventory.create({
    data: {
      productId: switch4.id,
      stock: 3000,
    },
  });
  await prisma.inventory.create({
    data: {
      productId: switch5.id,
      stock: 3000,
    },
  });
  await prisma.inventory.create({
    data: {
      productId: keycap1.id,
      stock: 3330,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: keycap2.id,
      stock: 3400, // Group buy
    },
  });

  await prisma.inventory.create({
    data: {
      productId: stabilizer.id,
      stock: 1500,
    },
  });
  await prisma.inventory.create({
    data: {
      productId: plate.id,
      stock: 1000,
    },
  });
  await prisma.inventory.create({
    data: {
      productId: coiledCable.id,
      stock: 1000,
    },
  });
  await prisma.inventory.create({
    data: {
      productId: keycap3.id,
      stock: 3000,
    },
  });
  await prisma.inventory.create({
    data: {
      productId: keycap4.id,
      stock: 3000,
    },
  });

  console.log('✅ Inventory created');

  // Create a sample cart for user2
  // const cart = await prisma.cart.create({
  //   data: {
  //     userId: user2.id,
  //     items: {
  //       create: [
  //         {
  //           productId: keyboard2.id,
  //           quantity: 1,
  //         },
  //         {
  //           productId: switch2.id,
  //           quantity: 90,
  //         },
  //         {
  //           productId: stabilizer.id,
  //           quantity: 1,
  //         },
  //       ],
  //     },
  //   },
  // })

  // await prisma.cart.create({
  //   data: {
  //     userId: user1.id,
  //     items: {
  //       create: [
  //         {
  //           productId: keyboard1.id,
  //           quantity: 1,
  //         },
  //       ],
  //     },
  //   },
  // })
  // await prisma.cart.create({
  //   data: {
  //     userId: user2.id,
  //     items: {
  //       create: [
  //         {
  //           productId: keyboard2.id,
  //           quantity: 1,
  //         },
  //         {
  //           productId: switch2.id,
  //           quantity: 90,
  //         },
  //       ],
  //     },
  //   },
  // })

  console.log('✅ Cart created');

  // // Create a sample order
  // const order = await prisma.order.create({
  //   data: {
  //     userId: user2.id,
  //     status: 'COMPLETED',
  //     totalAmount: 21400, // keyboard + switches
  //     items: {
  //       create: [
  //         {
  //           productId: keyboard1.id,
  //           quantity: 1,
  //           price: 18900,
  //         },
  //         {
  //           productId: coiledCable.id,
  //           quantity: 1,
  //           price: 4900,
  //         },
  //       ],
  //     },
  //   },
  // })

  // await prisma.order.create({
  //   data: {
  //     userId: user1.id,
  //     status: 'COMPLETED',
  //     totalAmount: 18900,
  //   },
  // })

  console.log('✅ Order created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
