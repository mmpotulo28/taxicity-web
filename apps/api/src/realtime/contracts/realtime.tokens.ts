export const REALTIME_EMITTER = Symbol('REALTIME_EMITTER');

export interface RealtimeEmitter {
  emitToChannel(channel: string, event: string, data: unknown): void;
}
