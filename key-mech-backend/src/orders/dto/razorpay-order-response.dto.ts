import { ApiProperty } from '@nestjs/swagger';

export class RazorpayOrderResponseDto {
  @ApiProperty({ description: 'Razorpay order ID', example: 'order_abc123' })
  orderId: string;

  @ApiProperty({ 
    description: 'Amount in smallest currency unit (paise)', 
    example: 100000,
    type: 'number'
  })
  amount: number | string;

  @ApiProperty({ description: 'Currency code', example: 'INR' })
  currency: string;

  @ApiProperty({ 
    description: 'Razorpay key ID for frontend checkout',
    example: 'rzp_test_abc123'
  })
  keyId: string;
}
