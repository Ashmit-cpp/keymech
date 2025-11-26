import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Category } from '../../../generated/prisma/enums.js';

import { CreateVariantDto } from './create-variant.dto.js';
import { CreateKeyboardSpecDto } from './create-keyboard-spec.dto.js';
import { CreateSwitchSpecDto } from './create-switch-spec.dto.js';
import { CreateKeycapSpecDto } from './create-keycap-spec.dto.js';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  price!: number; // cents

  @IsEnum(Category)
  category!: Category;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  soundTests?: string[];

  @IsOptional()
  @IsString()
  explodedView?: string;

  @IsOptional()
  @IsString()
  technicalSpec?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateKeyboardSpecDto)
  keyboardSpec?: CreateKeyboardSpecDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSwitchSpecDto)
  switchSpec?: CreateSwitchSpecDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateKeycapSpecDto)
  keycapSpec?: CreateKeycapSpecDto;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}
