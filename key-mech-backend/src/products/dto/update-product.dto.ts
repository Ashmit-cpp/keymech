import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto.js';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, [
    'keyboardSpec',
    'switchSpec',
    'keycapSpec',
    'variants',
  ] as const),
) {}
