import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CartModule } from './cart/cart.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProductsModule } from './products/products.module.js';
import { UsersModule } from './users/users.module.js';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // reads .env
    PrismaModule,
    ProductsModule,
    UsersModule,
    CartModule,
    OrdersModule,
    // TODO: add feature modules like ProductsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
