import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVariantDto {
  @ApiProperty({ type: String })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  extraPrice?: number; // cents

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  specs?: unknown; // flexible JSON for variant-level attributes
}
