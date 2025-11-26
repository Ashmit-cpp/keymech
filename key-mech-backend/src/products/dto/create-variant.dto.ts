import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsInt()
  extraPrice?: number; // cents

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  specs?: any; // flexible JSON for variant-level attributes
}
