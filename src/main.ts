import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseTransformInterceptor } from './shared/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.enableCors();

  setupOpenAPI(app);

  await app.listen(3001);
}
bootstrap();

function setupOpenAPI(app: INestApplication): void {
  const config = new DocumentBuilder().setTitle('CodeLabAPIUsuario').build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  Logger.log(
    'OpenAPI documentation available at http://localhost:3001/api/v1/docs',
  );
}
