// src/prisma/prisma.service.ts
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly skipConnection: boolean;

  constructor(@Inject(ConfigService) config: ConfigService) {
    const skipConnection =
      config.get<string>('SKIP_DATABASE_CONNECT') === 'true';
    const adapter = new PrismaPg({
      connectionString: config.getOrThrow<string>('DATABASE_URL'),
    });
    super({ adapter });
    this.skipConnection = skipConnection;
  }

  async onModuleInit() {
    if (this.skipConnection) return;
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
