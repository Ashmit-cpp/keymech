import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateWishlistItemDto {
  @ApiPropertyOptional({ description: 'Product ID', type: String })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'Variant ID', type: String })
  @IsOptional()
  @IsUUID()
  variantId?: string;
}
