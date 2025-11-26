import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Layout,
  MountingStyle,
  CaseMaterial,
  RGBOrientation,
  SwitchCompatibility,
  PlateMaterial,
  StabilizerType,
  Connectivity,
} from '../../../generated/prisma/enums.js';

export class CreateKeyboardSpecDto {
  @IsEnum(Layout)
  layout!: Layout;

  @IsEnum(MountingStyle)
  mountingStyle!: MountingStyle;

  @IsEnum(CaseMaterial)
  caseMaterial!: CaseMaterial;

  @IsEnum(RGBOrientation)
  rgbOrientation!: RGBOrientation;

  @IsBoolean()
  hotSwap!: boolean;

  @IsEnum(SwitchCompatibility)
  switchCompatibility!: SwitchCompatibility;

  // In schema connectivity is stored as Json (array). We'll validate as enum array here.
  @IsOptional()
  @IsArray()
  @IsEnum(Connectivity, { each: true })
  connectivity?: Connectivity[];

  @IsOptional()
  @IsEnum(PlateMaterial)
  plateMaterial?: PlateMaterial;

  @IsOptional()
  @IsBoolean()
  plateMountIncluded?: boolean;

  @IsOptional()
  @IsEnum(StabilizerType)
  stabilizerType?: StabilizerType;

  @IsOptional()
  @IsInt()
  weightGrams?: number;

  @IsOptional()
  @IsString()
  firmware?: string;

  @IsOptional()
  @IsString()
  isoAnsi?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
