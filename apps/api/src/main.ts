import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';
import { isAllowedCorsOrigin } from './realtime/config/realtime.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin, callback) => {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin ?? 'unknown'}`));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('TaxiCiti API')
    .setDescription('TaxiCiti backend APIs')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/reference',
    apiReference({
      content: document,
      pageTitle: 'TaxiCiti API Reference',
      theme: 'default',
    }),
  );

  app.use(
    '/api/docs',
    apiReference({
      content: document,
      pageTitle: 'TaxiCiti API Reference',
      theme: 'default',
    }),
  );

  await app.listen(process.env.PORT ?? 3006);
}
void bootstrap();
