import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCartItemDto } from './create-cart-item.dto.js';

export class CreateCartDto {
  @IsUUID()
  userId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  items!: CreateCartItemDto[];
}
