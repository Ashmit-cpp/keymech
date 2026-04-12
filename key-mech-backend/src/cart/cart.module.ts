import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuthMiddleware } from '../auth/auth.middleware.js';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [CartController],
  providers: [CartService, AuthMiddleware],
  exports: [CartService],
})
export class CartModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('cart');
  }
}
