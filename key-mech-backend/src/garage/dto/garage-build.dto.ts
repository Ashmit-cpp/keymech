import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export const GARAGE_LAYOUTS = ['65', '75', 'TKL'] as const;

export class GarageComponentSelectionDto {
  @ApiProperty({ type: String })
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsUUID()
  variantId?: string;
}

export class GarageSelectionsDto {
  @ApiProperty({ type: () => GarageComponentSelectionDto })
  @ValidateNested()
  @Type(() => GarageComponentSelectionDto)
  'case'!: GarageComponentSelectionDto;

  @ApiProperty({ type: () => GarageComponentSelectionDto })
  @ValidateNested()
  @Type(() => GarageComponentSelectionDto)
  pcb!: GarageComponentSelectionDto;

  @ApiProperty({ type: () => GarageComponentSelectionDto })
  @ValidateNested()
  @Type(() => GarageComponentSelectionDto)
  plate!: GarageComponentSelectionDto;

  @ApiProperty({ type: () => GarageComponentSelectionDto })
  @ValidateNested()
  @Type(() => GarageComponentSelectionDto)
  switches!: GarageComponentSelectionDto;

  @ApiProperty({ type: () => GarageComponentSelectionDto })
  @ValidateNested()
  @Type(() => GarageComponentSelectionDto)
  keycaps!: GarageComponentSelectionDto;

  @ApiProperty({ type: () => GarageComponentSelectionDto })
  @ValidateNested()
  @Type(() => GarageComponentSelectionDto)
  stabilizers!: GarageComponentSelectionDto;
}

export class CreateGarageBuildDto {
  @ApiProperty({ type: String })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ enum: GARAGE_LAYOUTS })
  @IsIn(GARAGE_LAYOUTS)
  layout!: (typeof GARAGE_LAYOUTS)[number];

  @ApiProperty({ type: () => GarageSelectionsDto })
  @ValidateNested()
  @Type(() => GarageSelectionsDto)
  selections!: GarageSelectionsDto;

  @ApiProperty({ type: Object })
  @IsObject()
  theme!: Record<string, unknown>;
}

export class UpdateGarageBuildDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ enum: GARAGE_LAYOUTS })
  @IsOptional()
  @IsIn(GARAGE_LAYOUTS)
  layout?: (typeof GARAGE_LAYOUTS)[number];

  @ApiPropertyOptional({ type: () => GarageSelectionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GarageSelectionsDto)
  selections?: GarageSelectionsDto;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  theme?: Record<string, unknown>;
}

export class GarageBuildResponseDto {
  @ApiProperty({ type: String })
  id!: string;

  @ApiProperty({ type: String })
  userId!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: Boolean })
  isPublic!: boolean;

  @ApiProperty({ enum: GARAGE_LAYOUTS })
  layout!: (typeof GARAGE_LAYOUTS)[number];

  @ApiProperty({ type: Object })
  selections!: unknown;

  @ApiProperty({ type: Object })
  theme!: unknown;

  @ApiProperty({ type: Number })
  totalPrice!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
