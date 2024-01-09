import { ValidationPipe } from '@nestjs/common'; // this is the validation pipe that will be used to validate the data sent to the server
import { NestFactory } from '@nestjs/core';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true})); // this function enables the validation pipe for all routes, validation pipe is used to validate the data sent to the server, whitelist: true means that the validation pipe will only allow the properties that are defined in the DTOs to be sent to the server, if a property is not defined in the DTO, it will be ignored
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    };
    app.enableCors(corsOptions);
    app.use(cookieParser());
  await app.listen(8080);
}
bootstrap();
