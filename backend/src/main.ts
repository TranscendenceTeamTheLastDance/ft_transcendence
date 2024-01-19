import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

async function bootstrap(): Promise<string>{
  // Crée une application NestJS
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Active la validation des DTO
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000', // Autorise l'origine de la requête
    credentials: true, // Autorise l'envoi des cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Ajoute les méthodes HTTP nécessaires
    allowedHeaders: ['Content-Type', 'Authorization'], // Ajoute les en-têtes CORS nécessaires
  };

  // Utilise le middleware CORS intégré de NestJS
  app.enableCors(corsOptions);

  app.use(cookieParser());

  await app.listen(8080);
  NestLogger.log('API listening on port 8080', 'Server');

  return app.getUrl();
}

// Cette partie de code est une fonction asynchrone auto-exécutée qui appelle la fonction bootstrap() et gère les erreurs éventuelles.
(async (): Promise<void> => {
  try {
    const url = await bootstrap();
    NestLogger.log(`API up at: ${url}`, 'Server'); // Affiche l'URL de l'API
  } catch (error) {
    NestLogger.error(error, 'Server');
  }
})();

