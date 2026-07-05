import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommerceItemKind } from '../../../generated/prisma/enums.js';
import {
  ProductResponseDto,
  ProductVariantResponseDto,
} from '../../products/dto/product-response.dto.js';

export class CartItemResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ enum: CommerceItemKind })
  kind!: CommerceItemKind;

  @ApiPropertyOptional({ type: String, nullable: true })
  productId?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  variantId?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  garageBuildId?: string | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  buildSnapshot?: unknown;

  @ApiPropertyOptional({ type: Number, nullable: true })
  unitPrice?: number | null;

  @ApiProperty({ type: Number })
  quantity!: number;

  @ApiPropertyOptional({
    type: () => ProductResponseDto,
    nullable: true,
  })
  product?: ProductResponseDto | null;

  @ApiPropertyOptional({
    type: () => ProductVariantResponseDto,
    nullable: true,
  })
  variant?: ProductVariantResponseDto | null;
}

export class CartResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  userId?: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: () => [CartItemResponseDto] })
  items!: CartItemResponseDto[];
}
