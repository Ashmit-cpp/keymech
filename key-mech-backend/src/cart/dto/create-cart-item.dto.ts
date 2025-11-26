import { IsInt, IsOptional, IsUUID } from 'class-validator';

export class CreateCartItemDto {
  @IsUUID()
  productId!: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsInt()
  quantity!: number;
}
