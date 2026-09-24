import { NestFactory } from '@nestjs/core';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import { AppModule } from './app.module';

dotenv.config({ path: resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(clerkMiddleware());

  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server is running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
