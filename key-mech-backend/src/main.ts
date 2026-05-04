import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
import { createOpenApiDocument } from './openapi.js';
import type { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_ORIGIN'),
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (config.get<string>('NODE_ENV') !== 'production') {
    const document = createOpenApiDocument(app);
    SwaggerModule.setup('api', app, document);

    app.use('/openapi.json', (_req: Request, res: Response) => {
      res.send(document);
    });
  }

  const port = Number(config.getOrThrow<string>('PORT'));
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`API Documentation: http://localhost:${port}/api`);
  logger.log(`Environment: ${config.get<string>('NODE_ENV')}`);
}
void bootstrap();
