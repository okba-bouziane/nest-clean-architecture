import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { DomainExceptionFilter } from './presentation/http/domain-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new DomainExceptionFilter());

  const swagger = new DocumentBuilder()
    .setTitle('Clean Tasks API')
    .setDescription(
      'NestJS clean architecture with PostgreSQL, MongoDB and Keycloak',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, () =>
    SwaggerModule.createDocument(app, swagger),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
