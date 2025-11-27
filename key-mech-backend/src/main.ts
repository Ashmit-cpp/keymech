import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('KeyMech API')
    .setDescription('API documentation for KeyMech mechanical keyboard e-commerce platform')
    .setVersion('1.0')
    .addTag('products', 'Product management endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('orders', 'Order management endpoints')
    .addTag('cart', 'Shopping cart endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // 🔥 NEW: Serve openapi.json for Orval/openapi-codegen
  app.use('/openapi.json', (req, res) => {
    res.send(document);
  });

  fs.writeFileSync(
    join(process.cwd(), '../packages/api-schema/openapi.json'),
    JSON.stringify(document, null, 2),
  );
  

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  await app.listen(process.env.PORT || 3005);
}
bootstrap();