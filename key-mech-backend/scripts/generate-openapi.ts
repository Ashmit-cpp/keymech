import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { writeSync } from 'node:fs';

async function generateOpenApi() {
  process.env.SKIP_DATABASE_CONNECT = 'true';

  const { NestFactory } = await import('@nestjs/core');
  const { AppModule } = await import('../src/app.module.js');
  const { createOpenApiDocument } = await import('../src/openapi.js');

  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    logger: false,
  });
  await app.init();

  const document = createOpenApiDocument(app);
  const target = join(process.cwd(), '../packages/api-schema/openapi.json');
  await writeFile(target, `${JSON.stringify(document, null, 2)}\n`);

  await app.close();
  writeSync(1, `OpenAPI schema written to ${target}\n`);
  process.exitCode = 0;
}

generateOpenApi().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack || error.message : error;
  writeSync(2, `${String(message)}\n`);
  process.exitCode = 1;
});
