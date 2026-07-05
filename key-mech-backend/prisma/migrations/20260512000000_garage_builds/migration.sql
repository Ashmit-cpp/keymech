-- Add Garage saved builds and cart/order bundle support.
CREATE TYPE "CommerceItemKind" AS ENUM ('PRODUCT', 'GARAGE_BUILD');

CREATE TABLE "GarageBuild" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "layout" TEXT NOT NULL,
    "selections" JSONB NOT NULL,
    "theme" JSONB NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GarageBuild_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CartItem"
    ADD COLUMN "kind" "CommerceItemKind" NOT NULL DEFAULT 'PRODUCT',
    ADD COLUMN "garageBuildId" TEXT,
    ADD COLUMN "buildSnapshot" JSONB,
    ADD COLUMN "unitPrice" INTEGER,
    ALTER COLUMN "productId" DROP NOT NULL;

ALTER TABLE "OrderItem" RENAME COLUMN "price" TO "unitPrice";

ALTER TABLE "OrderItem"
    ADD COLUMN "kind" "CommerceItemKind" NOT NULL DEFAULT 'PRODUCT',
    ADD COLUMN "garageBuildId" TEXT,
    ADD COLUMN "buildSnapshot" JSONB,
    ALTER COLUMN "productId" DROP NOT NULL;

CREATE INDEX "GarageBuild_userId_idx" ON "GarageBuild"("userId");
CREATE INDEX "GarageBuild_isPublic_idx" ON "GarageBuild"("isPublic");
CREATE INDEX "CartItem_kind_idx" ON "CartItem"("kind");
CREATE INDEX "CartItem_garageBuildId_idx" ON "CartItem"("garageBuildId");
CREATE INDEX "OrderItem_kind_idx" ON "OrderItem"("kind");
CREATE INDEX "OrderItem_garageBuildId_idx" ON "OrderItem"("garageBuildId");

ALTER TABLE "GarageBuild" ADD CONSTRAINT "GarageBuild_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_garageBuildId_fkey" FOREIGN KEY ("garageBuildId") REFERENCES "GarageBuild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_garageBuildId_fkey" FOREIGN KEY ("garageBuildId") REFERENCES "GarageBuild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_product_or_garage_build_check" CHECK (
    (
        "kind" = 'PRODUCT'
        AND "productId" IS NOT NULL
        AND "garageBuildId" IS NULL
        AND "buildSnapshot" IS NULL
        AND "unitPrice" IS NULL
    )
    OR
    (
        "kind" = 'GARAGE_BUILD'
        AND "productId" IS NULL
        AND "variantId" IS NULL
        AND "garageBuildId" IS NOT NULL
        AND "buildSnapshot" IS NOT NULL
        AND "unitPrice" IS NOT NULL
    )
);

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_product_or_garage_build_check" CHECK (
    (
        "kind" = 'PRODUCT'
        AND "productId" IS NOT NULL
        AND "garageBuildId" IS NULL
        AND "buildSnapshot" IS NULL
    )
    OR
    (
        "kind" = 'GARAGE_BUILD'
        AND "productId" IS NULL
        AND "variantId" IS NULL
        AND "buildSnapshot" IS NOT NULL
    )
);
