import { Injectable } from '@nestjs/common';
import fs from 'node:fs';
import path from 'node:path';
import type { OpenApiDocumentDto } from '../common/user-api.dto';

@Injectable()
export class UserSystemService {
  status() {
    return {
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        users: '/api/user/users',
        drivers: '/api/user/drivers',
        taxis: '/api/user/taxis',
        routes: '/api/user/routes',
        ranks: '/api/user/ranks',
        reports: '/api/user/reports',
        support: '/api/user/support',
        search: '/api/user/search',
      },
      documentation: {
        interactive: '/reference',
        openapi: '/api/user/openapi',
        readme: '/docs/API.md',
      },
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };
  }

  openapi(): OpenApiDocumentDto {
    const filePath = path.join(process.cwd(), 'docs', 'openapi.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents) as OpenApiDocumentDto;
  }
}
