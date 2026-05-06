import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../../generated/prisma/enums.js';

export class OrderProductResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: String, nullable: true, required: false })
  images?: string | null;
}

export class OrderVariantResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: Number })
  extraPrice!: number;
}

export class OrderUserResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  email!: string;

  @ApiProperty({ type: String, nullable: true, required: false })
  name?: string | null;
}

export class OrderItemResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  productId!: string;

  @ApiProperty({ type: String, nullable: true, required: false })
  variantId?: string | null;

  @ApiProperty({ type: Number })
  quantity!: number;

  @ApiProperty({ type: Number, description: 'Unit price in paise' })
  price!: number;

  @ApiProperty({ type: () => OrderProductResponseDto })
  product!: OrderProductResponseDto;

  @ApiProperty({
    type: () => OrderVariantResponseDto,
    nullable: true,
    required: false,
  })
  variant?: OrderVariantResponseDto | null;
}

export class OrderResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  userId!: string;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty({ type: Number, description: 'Total in paise' })
  totalAmount!: number;

  @ApiProperty({ type: String, nullable: true, required: false })
  razorpayOrderId?: string | null;

  @ApiProperty({ type: String, nullable: true, required: false })
  razorpayPaymentId?: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: () => [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty({
    type: () => OrderUserResponseDto,
    nullable: true,
    required: false,
  })
  user?: OrderUserResponseDto | null;
}
