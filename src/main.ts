import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Activer CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: true, // Permet toutes les origines
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Autoriser les cookies et les en-têtes d'authentification
  });

  // Servir des fichiers statiques depuis le dossier 'uploads'
  app.use('./uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(3001);
}
bootstrap();
