import {
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GuestCartItemDto {
  @ApiProperty({ description: 'Product ID', type: String })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: 'Variant ID (optional)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiProperty({ description: 'Quantity', type: Number })
  @IsInt()
  quantity!: number;
}

export class MergeGuestCartDto {
  @ApiProperty({
    description: 'Array of cart items from guest cart',
    type: () => GuestCartItemDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDto)
  items!: GuestCartItemDto[];
}
