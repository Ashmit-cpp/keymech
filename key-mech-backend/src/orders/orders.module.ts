import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { PaymentService } from './payment.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuthMiddleware } from '../auth/auth.middleware.js';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, PaymentService, AuthMiddleware],
})
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('orders');
  }
}
