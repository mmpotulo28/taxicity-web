import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../../common/public.decorator';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserSystemService } from './system.service';

@Controller('api/user')
@ApiTags('User - System')
export class UserSystemController {
  constructor(private readonly userSystemService: UserSystemService) {}

  @Get('status')
  @Public()
  @ApiOperation({
    summary: 'Get API status',
    description:
      'Returns API status and useful runtime metadata for health checks.',
  })
  @ApiOkResponse({ description: 'API status returned successfully.' })
  @ApiServiceUnavailableResponse({
    description: 'One or more backing services are unavailable.',
  })
  status() {
    return this.userSystemService.status();
  }

  @Get('openapi')
  @Public()
  @ApiOperation({
    summary: 'Get OpenAPI document',
    description:
      'Returns the OpenAPI specification JSON for external tooling and integrations.',
  })
  @ApiOkResponse({ description: 'OpenAPI document returned successfully.' })
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'GET')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  @Header('Cache-Control', 'public, max-age=3600')
  openapi() {
    return this.userSystemService.openapi();
  }
}
