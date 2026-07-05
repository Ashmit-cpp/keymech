import { Module, forwardRef } from '@nestjs/common';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { GarageModule } from '../garage/garage.module.js';

@Module({
  imports: [forwardRef(() => AuthModule), GarageModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
