import { Controller, Get, Header } from '@nestjs/common';
import { UserSystemService } from './system.service';

@Controller('api/user')
export class UserSystemController {
  constructor(private readonly userSystemService: UserSystemService) {}

  @Get('status')
  status() {
    return this.userSystemService.status();
  }

  @Get('openapi')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'GET')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  @Header('Cache-Control', 'public, max-age=3600')
  openapi() {
    return this.userSystemService.openapi();
  }
}
