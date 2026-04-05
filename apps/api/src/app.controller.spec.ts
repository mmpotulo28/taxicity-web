import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AppController } from './app.controller';
import { realtimeConfig } from './realtime/config/realtime.config';
import { REALTIME_EMITTER } from './realtime/contracts/realtime.tokens';

describe('AppController', () => {
  let appController: AppController;
  const realtimeGatewayMock = {
    emitToChannel: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: REALTIME_EMITTER, useValue: realtimeGatewayMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
    realtimeGatewayMock.emitToChannel.mockClear();
  });

  describe('health', () => {
    it('should return ok status', () => {
      expect(appController.getHealth().status).toBe('ok');
    });
  });

  describe('trigger', () => {
    it('should emit to channel with valid api key', () => {
      const payload = { id: '1' };

      const result = appController.trigger(realtimeConfig.internalApiKey, {
        channel: 'driver',
        event: 'new-ride-request',
        data: payload,
      });

      expect(result).toEqual({ status: 'success' });
      expect(realtimeGatewayMock.emitToChannel).toHaveBeenCalledWith(
        'driver',
        'new-ride-request',
        payload,
      );
    });

    it('should reject invalid api key', () => {
      expect(() =>
        appController.trigger('invalid-key', {
          channel: 'driver',
          event: 'new-ride-request',
          data: {},
        }),
      ).toThrow(UnauthorizedException);
    });
  });
});
