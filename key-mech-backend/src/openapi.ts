import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('KeyMech API')
    .setDescription(
      'API documentation for KeyMech mechanical keyboard e-commerce platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('products', 'Product management endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('orders', 'Order management endpoints')
    .addTag('cart', 'Shopping cart endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('wishlist', 'Wishlist management endpoints')
    .build();

  return SwaggerModule.createDocument(app, config);
}
