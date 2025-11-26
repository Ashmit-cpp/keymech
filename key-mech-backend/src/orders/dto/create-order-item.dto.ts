import { IsInt, IsNumber, IsUUID } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  productVariantId?: string;

  @IsInt()
  quantity!: number;

  @IsNumber()
  price!: number; // cents - snapshot
}
