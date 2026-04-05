export interface QueueSourceRouteDto {
  id: string;
  name: string;
}

export interface QueueRankDto {
  id: string;
  name: string;
  sourceRoutes: QueueSourceRouteDto[];
}

export interface QueueStatusDto {
  inQueue: boolean;
  rank?: QueueRankDto;
  position?: number;
  queueLength?: number;
  joinedAt?: Date;
}

export interface QueueJoinResponseDto {
  success: true;
  rank: string;
  position: number;
  joinedAt: Date;
}

export interface QueueLeaveResponseDto {
  success: true;
  message: string;
}
