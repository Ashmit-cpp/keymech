import {
  IsArray,
  IsEnum,
  IsInt,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../../generated/prisma/enums.js';
import { CreateOrderItemDto } from './create-order-item.dto.js';

export class CreateOrderDto {
  @IsUUID()
  userId!: string;

  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsInt()
  totalAmount!: number; // cents

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
