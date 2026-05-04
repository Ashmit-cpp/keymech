import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;
  private keyId: string;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    const keyId = this.configService.getOrThrow<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.getOrThrow<string>('RAZORPAY_SECRET');

    this.keyId = keyId;
    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  getKeyId(): string {
    return this.keyId;
  }

  async createRazorpayOrder(amount: number, currency = 'INR') {
    try {
      const options = {
        amount: amount, // amount in smallest currency unit (paise for INR)
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          description: 'KeyMech Order',
        },
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to create Razorpay order: ${message}`,
      );
    }
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    try {
      const keySecret =
        this.configService.getOrThrow<string>('RAZORPAY_SECRET');
      const text = `${orderId}|${paymentId}`;
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(text)
        .digest('hex');

      return generated_signature === signature;
    } catch {
      return false;
    }
  }
}
