import { IsOptional, IsUUID } from 'class-validator';

export class CreateWishlistItemDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;
}