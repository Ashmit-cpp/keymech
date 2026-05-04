import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../../../generated/prisma/enums.js';

export class ProductVariantResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  productId!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  sku?: string | null;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: Number })
  extraPrice!: number;

  @ApiPropertyOptional({ type: Object, nullable: true })
  images?: unknown;

  @ApiPropertyOptional({ type: Object, nullable: true })
  specs?: unknown;
}

export class ProductResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: String })
  slug!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description?: string | null;

  @ApiProperty({ type: Number })
  price!: number;

  @ApiProperty({ enum: Category })
  category!: Category;

  @ApiPropertyOptional({ type: String, nullable: true })
  status?: string | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  images?: unknown;

  @ApiPropertyOptional({ type: Object, nullable: true })
  gallery?: unknown;

  @ApiPropertyOptional({ type: Object, nullable: true })
  soundTests?: unknown;

  @ApiProperty({ type: () => ProductVariantResponseDto, isArray: true })
  variants!: ProductVariantResponseDto[];

  @ApiPropertyOptional({ type: Object, nullable: true })
  keyboardSpec?: unknown;

  @ApiPropertyOptional({ type: Object, nullable: true })
  switchSpec?: unknown;

  @ApiPropertyOptional({ type: Object, nullable: true })
  keycapSpec?: unknown;
}
