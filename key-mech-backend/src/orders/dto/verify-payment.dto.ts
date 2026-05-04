import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'User ID', type: String })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Razorpay order ID', type: String })
  @IsString()
  razorpay_order_id: string;

  @ApiProperty({ description: 'Razorpay payment ID', type: String })
  @IsString()
  razorpay_payment_id: string;

  @ApiProperty({ description: 'Razorpay signature', type: String })
  @IsString()
  razorpay_signature: string;
}
