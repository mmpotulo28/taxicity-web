import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { isAllowedCorsOrigin } from './realtime/config/realtime.config';

async function bootstrap() {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is required to start the API');
  }

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

  const apiDescription = `
## Overview

TaxiCiti backend APIs for user, driver, and realtime operations.

## Base URL

- Local: \`http://localhost:3006\`
- Production: your ECS/ALB domain, e.g. \`https://api.taxiciti.net\`

## Authentication

All REST endpoints require a Clerk session token in the \`Authorization\` header.

1. Obtain a Clerk session token on the client (template: \`taxiciti_api\`).
2. Send \`Authorization: Bearer <token>\` with every request.

## Realtime

- WebSocket events are available through Socket.IO endpoints.
- REST and realtime flows share domain entities (trips, statuses, notifications).

## Common Status Codes

- \`200\` Success
- \`201\` Created
- \`400\` Validation / bad payload
- \`401\` Unauthorized
- \`403\` Forbidden
- \`404\` Not found
- \`500\` Internal server error
`;

  const config = new DocumentBuilder()
    .setTitle('TaxiCiti API')
    .setDescription(apiDescription)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Clerk session bearer token (template: taxiciti_api)',
      },
      'bearerAuth',
    )
    .addTag('Health', 'Service health and readiness checks')
    .addTag('System', 'System status and OpenAPI metadata endpoints')
    .addTag('User - Routes', 'Route discovery and route details for users')
    .addTag('User - Ranks', 'Taxi rank listings and rank metadata')
    .addTag('User - Trips', 'Trip lifecycle, boarding, and trip rating')
    .addTag('User - Taxis', 'Taxi discovery and availability for user flow')
    .addTag('User - Drivers', 'Driver discovery and driver profile lookups')
    .addTag('User - Users', 'User profile and saved location operations')
    .addTag('User - Reports', 'Reporting endpoints for user-facing analytics')
    .addTag('User - Support', 'Support tickets and support content')
    .addTag('User - Search', 'Search endpoints across user domain entities')
    .addTag('Driver - Me', 'Driver profile and assignment metadata')
    .addTag('Driver - Apply', 'Driver onboarding and application workflows')
    .addTag('Driver - Routes', 'Driver route assignment and listing')
    .addTag('Driver - Ranks', 'Driver queue/rank operations')
    .addTag('Driver - Trips', 'Driver trip and passenger status operations')
    .addTag('Driver - Vehicle', 'Driver vehicle state and management endpoints')
    .addTag('Driver - Earnings', 'Driver earnings and payout-related endpoints')
    .addTag('Upload', 'File upload APIs (documents/media)')
    .addTag('Internal', 'Internal service trigger/event endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3006);
}
void bootstrap();
