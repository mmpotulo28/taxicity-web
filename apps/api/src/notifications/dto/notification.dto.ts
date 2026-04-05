export type NotificationTypeDto =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'TRIP_UPDATE'
  | 'PAYMENT';

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: NotificationTypeDto;
  read: boolean;
  createdAt: string;
  actionUrl?: string | null;
}

export interface SuccessResponseDto {
  success: true;
}
