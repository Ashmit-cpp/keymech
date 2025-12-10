import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GuestWishlistItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ description: 'Variant ID (optional)', required: false })
  @IsOptional()
  @IsUUID()
  variantId?: string;
}

export class MergeGuestWishlistDto {
  @ApiProperty({
    description: 'Array of wishlist items from guest wishlist',
    type: [GuestWishlistItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestWishlistItemDto)
  items!: GuestWishlistItemDto[];
}