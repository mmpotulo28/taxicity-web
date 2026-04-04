import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { realtimeConfig } from './realtime/config/realtime.config';
import {
  REALTIME_EMITTER,
  type RealtimeEmitter,
} from './realtime/contracts/realtime.tokens';

interface TriggerRequest {
  channel?: string;
  event?: string;
  data?: unknown;
}

@Controller()
export class AppController {
  constructor(
    @Inject(REALTIME_EMITTER)
    private readonly realtimeGateway: RealtimeEmitter,
  ) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('trigger')
  trigger(
    @Headers('x-api-key') apiKey: string | undefined,
    @Body() body: TriggerRequest,
  ) {
    if (apiKey !== realtimeConfig.internalApiKey) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!body.channel || !body.event) {
      throw new BadRequestException('Missing channel or event');
    }

    this.realtimeGateway.emitToChannel(
      body.channel,
      body.event,
      body.data ?? {},
    );
    return { status: 'success' };
  }
}
