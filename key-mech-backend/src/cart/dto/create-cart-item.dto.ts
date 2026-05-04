import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({ description: 'Product ID', type: String })
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({ description: 'Variant ID', type: String })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiProperty({ minimum: 1, type: Number })
  @IsInt()
  quantity!: number;
}
