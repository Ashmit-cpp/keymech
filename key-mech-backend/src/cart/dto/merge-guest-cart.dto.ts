import { IsArray, IsInt, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GuestCartItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'Variant ID (optional)', required: false })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiProperty({ description: 'Quantity' })
  @IsInt()
  quantity!: number;
}

export class MergeGuestCartDto {
  @ApiProperty({ 
    description: 'Array of cart items from guest cart',
    type: [GuestCartItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemDto)
  items!: GuestCartItemDto[];
}
