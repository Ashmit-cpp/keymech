import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;
  private keyId: string;

  constructor(private configService?: ConfigService) {
    console.log('[PaymentService] typeof configService:', typeof configService);

    const keyId =
      this.configService?.get<string>('RAZORPAY_KEY_ID') ??
      process.env.RAZORPAY_KEY_ID;
    const keySecret =
      this.configService?.get<string>('RAZORPAY_SECRET') ??
      process.env.RAZORPAY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error(
        'Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_SECRET in .env',
      );
    }

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
    } catch (error) {
      throw new BadRequestException(
        `Failed to create Razorpay order: ${error.message}`,
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
        this.configService?.get<string>('RAZORPAY_SECRET') ??
        process.env.RAZORPAY_SECRET;
      if (!keySecret) {
        throw new Error('RAZORPAY_SECRET not configured');
      }
      const text = `${orderId}|${paymentId}`;
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(text)
        .digest('hex');

      return generated_signature === signature;
    } catch (error) {
      return false;
    }
  }
}
