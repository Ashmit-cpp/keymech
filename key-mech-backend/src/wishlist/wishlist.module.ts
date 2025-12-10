import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WishlistController } from './wishlist.controller.js';
import { WishlistService } from './wishlist.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuthMiddleware } from '../auth/auth.middleware.js';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [WishlistController],
  providers: [WishlistService, AuthMiddleware],
  exports: [WishlistService],
})
export class WishlistModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('wishlist');
  }
}