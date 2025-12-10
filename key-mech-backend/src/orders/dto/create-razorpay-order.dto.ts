import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRazorpayOrderDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;
}
