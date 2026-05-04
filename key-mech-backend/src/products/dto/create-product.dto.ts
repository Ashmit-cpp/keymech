import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: Number })
  @IsInt()
  price!: number; // cents

  @ApiProperty({ enum: Category })
  @IsEnum(Category)
  category!: Category;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  soundTests?: string[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  explodedView?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  technicalSpec?: string;

  @ApiPropertyOptional({ type: CreateKeyboardSpecDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateKeyboardSpecDto)
  keyboardSpec?: CreateKeyboardSpecDto;

  @ApiPropertyOptional({ type: CreateSwitchSpecDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSwitchSpecDto)
  switchSpec?: CreateSwitchSpecDto;

  @ApiPropertyOptional({ type: CreateKeycapSpecDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateKeycapSpecDto)
  keycapSpec?: CreateKeycapSpecDto;

  @ApiPropertyOptional({ type: [CreateVariantDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}
