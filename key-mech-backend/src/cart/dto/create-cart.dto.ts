import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCartItemDto } from './create-cart-item.dto.js';

export class CreateCartDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  items!: CreateCartItemDto[];
}
