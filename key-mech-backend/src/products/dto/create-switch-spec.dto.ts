import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SwitchType } from '../../../generated/prisma/enums.js';

export class CreateSwitchSpecDto {
  @IsEnum(SwitchType)
  switchType!: SwitchType;

  @IsOptional()
  @IsString()
  stemMaterial?: string;

  @IsOptional()
  @IsString()
  topHousing?: string;

  @IsOptional()
  @IsString()
  bottomHousing?: string;

  @IsOptional()
  @IsInt()
  springWeight?: number;

  @IsOptional()
  @IsNumber()
  preTravel?: number;

  @IsOptional()
  @IsNumber()
  totalTravel?: number;

  @IsOptional()
  @IsBoolean()
  lubed?: boolean;

  @IsOptional()
  @IsString()
  soundProfile?: string;

  @IsOptional()
  @IsString()
  pins?: string;
}
