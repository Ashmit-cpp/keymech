-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('KEYBOARD', 'SWITCH', 'KEYCAP', 'PLATE', 'PCB', 'STABILIZER', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Layout" AS ENUM ('ALICE', 'ORTHOLINEAR', 'P60', 'P65', 'P75', 'TKL', 'FULL', 'OTHER');

-- CreateEnum
CREATE TYPE "MountingStyle" AS ENUM ('TRAY', 'GASKET', 'TOP', 'PLATE', 'OTHER');

-- CreateEnum
CREATE TYPE "CaseMaterial" AS ENUM ('ALUMINUM', 'ABS', 'PC', 'ACRYLIC', 'PBT', 'OTHER');

-- CreateEnum
CREATE TYPE "RGBOrientation" AS ENUM ('SOUTH', 'NORTH', 'NONE');

-- CreateEnum
CREATE TYPE "SwitchCompatibility" AS ENUM ('THREE_PIN', 'FIVE_PIN', 'BOTH');

-- CreateEnum
CREATE TYPE "Connectivity" AS ENUM ('WIRED', 'WIRELESS', 'BLUETOOTH', 'TWO_POINT_FOUR_GHZ');

-- CreateEnum
CREATE TYPE "SwitchType" AS ENUM ('LINEAR', 'TACTILE', 'CLICKY', 'OTHER');

-- CreateEnum
CREATE TYPE "PlateMaterial" AS ENUM ('ALUMINUM', 'BRASS', 'FR4', 'PC', 'STEEL', 'OTHER');

-- CreateEnum
CREATE TYPE "KeycapProfile" AS ENUM ('CHERRY', 'OEM', 'SA', 'DSA', 'XDA', 'OTHER');

-- CreateEnum
CREATE TYPE "KeycapMaterial" AS ENUM ('PBT', 'ABS', 'OTHER');

-- CreateEnum
CREATE TYPE "StabilizerType" AS ENUM ('SCREW_IN', 'CLIP_IN', 'PCB_MOUNT', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "category" "Category" NOT NULL,
    "status" TEXT,
    "images" JSONB,
    "gallery" JSONB,
    "soundTests" JSONB,
    "explodedView" TEXT,
    "technicalSpec" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "extraPrice" INTEGER NOT NULL DEFAULT 0,
    "images" JSONB,
    "specs" JSONB,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyboardSpec" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "layout" "Layout" NOT NULL,
    "mountingStyle" "MountingStyle" NOT NULL,
    "caseMaterial" "CaseMaterial" NOT NULL,
    "rgbOrientation" "RGBOrientation" NOT NULL,
    "hotSwap" BOOLEAN NOT NULL DEFAULT false,
    "switchCompatibility" "SwitchCompatibility" NOT NULL,
    "connectivity" JSONB,
    "plateMaterial" "PlateMaterial",
    "plateMountIncluded" BOOLEAN NOT NULL DEFAULT false,
    "stabilizerType" "StabilizerType",
    "weightGrams" INTEGER,
    "firmware" TEXT,
    "isoAnsi" TEXT,
    "notes" TEXT,

    CONSTRAINT "KeyboardSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwitchSpec" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "switchType" "SwitchType" NOT NULL,
    "stemMaterial" TEXT,
    "topHousing" TEXT,
    "bottomHousing" TEXT,
    "springWeight" INTEGER,
    "preTravel" DOUBLE PRECISION,
    "totalTravel" DOUBLE PRECISION,
    "lubed" BOOLEAN DEFAULT false,
    "soundProfile" TEXT,
    "pins" TEXT,

    CONSTRAINT "SwitchSpec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeycapSpec" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "profile" "KeycapProfile" NOT NULL,
    "material" "KeycapMaterial" NOT NULL,
    "thickness" DOUBLE PRECISION,
    "legends" TEXT,
    "rowSupport" BOOLEAN,
    "notes" TEXT,

    CONSTRAINT "KeycapSpec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_key" ON "Inventory"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_variantId_key" ON "Inventory"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "KeyboardSpec_productId_key" ON "KeyboardSpec"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "SwitchSpec_productId_key" ON "SwitchSpec"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "KeycapSpec_productId_key" ON "KeycapSpec"("productId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyboardSpec" ADD CONSTRAINT "KeyboardSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwitchSpec" ADD CONSTRAINT "SwitchSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeycapSpec" ADD CONSTRAINT "KeycapSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
