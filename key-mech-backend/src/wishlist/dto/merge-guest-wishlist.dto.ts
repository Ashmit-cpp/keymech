import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GuestWishlistItemDto {
  @ApiProperty({ description: 'Product ID', type: String })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({
    description: 'Variant ID (optional)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsUUID()
  variantId?: string;
}

export class MergeGuestWishlistDto {
  @ApiProperty({
    description: 'Array of wishlist items from guest wishlist',
    type: () => GuestWishlistItemDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestWishlistItemDto)
  items!: GuestWishlistItemDto[];
}
