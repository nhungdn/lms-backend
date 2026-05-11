import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove properties that do not have any decorators
      forbidNonWhitelisted: true, // throw an error if non-whitelisted properties are present
      transform: true, // automatically transform payloads to be objects typed according to their DTO classes
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
