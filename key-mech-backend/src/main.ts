import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';

import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS first, before any other middleware
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('KeyMech API')
      .setDescription('API documentation for KeyMech mechanical keyboard e-commerce platform')
      .setVersion('1.0')
      .addTag('products', 'Product management endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('orders', 'Order management endpoints')
      .addTag('cart', 'Shopping cart endpoints')
      .addTag('auth', 'Authentication endpoints')
      .addTag('wishlist', 'Wishlist management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document);

    app.use('/openapi.json', (req, res) => {
      res.send(document);
    });

    fs.writeFileSync(
      join(process.cwd(), '../packages/api-schema/openapi.json'),
      JSON.stringify(document, null, 2),
    );
  }

  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();