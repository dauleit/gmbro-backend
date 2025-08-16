import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { RedisIoAdapter } from './common/redis-adapter';
import { AllExceptionFilter } from './common/filters/allException.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomValidationPipe } from './common/pipes/validation-pipe';
import { raw } from 'express';

export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors();

  // Uses Redis Adaptor
  app.useWebSocketAdapter(new RedisIoAdapter((<any>app).getHttpServer()));

  // Enable Shutdown Hooks
  app.enableShutdownHooks();

  // Uses Validation Pipes
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );
  // Với Stripe webhook thì cần raw body
  app.use('/api/v1/payment/callback', raw({ type: 'application/json' }));
  // Add a route prefix 'api'
  app.setGlobalPrefix('api');

  // Versioning API using MEDIA_TYPE
  app.enableVersioning({
    type: VersioningType.URI
  });

  // Request Body Parser
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bodyParser = require('body-parser');

  // Add limitations to Request Body
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  // Apply Global Exception Filters
  app.useGlobalFilters(new AllExceptionFilter());
  // /** End Security **/
  // Swagger Documentation
  const options = new DocumentBuilder().setTitle('Base Project API').setDescription('Base Project API').setVersion('1').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  return app;
}
