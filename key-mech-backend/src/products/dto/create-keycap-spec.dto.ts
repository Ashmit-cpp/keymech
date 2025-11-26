import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { KeycapProfile, KeycapMaterial } from '../../../generated/prisma/enums.js';

export class CreateKeycapSpecDto {
  @IsEnum(KeycapProfile)
  profile!: KeycapProfile;

  @IsEnum(KeycapMaterial)
  material!: KeycapMaterial;

  @IsOptional()
  @IsNumber()
  thickness?: number;

  @IsOptional()
  @IsString()
  legends?: string;

  @IsOptional()
  @IsBoolean()
  rowSupport?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
