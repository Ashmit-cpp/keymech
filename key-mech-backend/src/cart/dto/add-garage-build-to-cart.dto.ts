import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID } from 'class-validator';

export class AddGarageBuildToCartDto {
  @ApiProperty({ type: String })
  @IsUUID()
  garageBuildId!: string;

  @ApiProperty({ type: Number })
  @IsInt()
  quantity!: number;
}
