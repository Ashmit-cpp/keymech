import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Razorpay order ID' })
  @IsString()
  razorpay_order_id: string;

  @ApiProperty({ description: 'Razorpay payment ID' })
  @IsString()
  razorpay_payment_id: string;

  @ApiProperty({ description: 'Razorpay signature' })
  @IsString()
  razorpay_signature: string;
}
