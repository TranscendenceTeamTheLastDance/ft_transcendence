import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Ajoute les méthodes HTTP nécessaires
    allowedHeaders: ['Content-Type', 'Authorization'], // Ajoute les en-têtes CORS nécessaires
  };

  // Utilise le middleware CORS intégré de NestJS
  app.enableCors(corsOptions);

  app.use(cookieParser());

  await app.listen(8080);
}

bootstrap();
