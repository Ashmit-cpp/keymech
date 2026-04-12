import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { CartModule } from '../cart/cart.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './jwt.strategy.js';
import { OptionalJwtAuthGuard } from './optional-jwt.guard.js';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => CartModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OptionalJwtAuthGuard],
  exports: [AuthService, OptionalJwtAuthGuard, JwtModule],
})
export class AuthModule {}

