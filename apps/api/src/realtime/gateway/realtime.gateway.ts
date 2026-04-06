import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createAdapter } from '@socket.io/redis-adapter';
import { prisma, redis } from '@taxiciti/database';
import type { PaymentMethod, TripStatus } from '@taxiciti/database/types';
import {
  CHANNELS,
  EVENTS,
  logger,
  type ChatMessagePayload,
  type DriverLocationMessage,
  type RideAcceptedPayload,
  type RideDeclinedPayload,
  type RideRequestPayload,
  type RideStatusPayload,
  type WsAck,
} from '@taxiciti/utils';
import jwt from 'jsonwebtoken';
import type Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import { isAllowedCorsOrigin } from '../config/realtime.config';
import { RealtimeRedisService } from '../infra/realtime.redis.service';
import { LocationQueueService } from '../location/location-queue.service';
import { RealtimeQueueService } from '../queue/realtime.queue.service';
import { RealtimeTripService } from '../trips/realtime.trip.service';

interface SocketData {
  userId?: string;
  role?: string;
}

interface DriverQueuePayload {
  rankId: string;
  taxiId: string;
}

interface NotificationMarkReadPayload {
  id?: string;
}

interface NotificationSendPayload {
  title: string;
  message: string;
  type: string;
  userId?: string;
}

interface RealtimeNotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string | null;
}

const PAYMENT_METHODS = new Set<PaymentMethod>([
  'CASH',
  'QR_CODE',
  'MOBILE_MONEY',
]);

const TRIP_STATUSES = new Set<TripStatus>([
  'REQUESTED',
  'ACCEPTED',
  'ARRIVED_AT_PICKUP',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin ?? 'unknown'}`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;

  private adapterPubClient?: Redis;
  private adapterSubClient?: Redis;

  constructor(
    private readonly redisService: RealtimeRedisService,
    private readonly locationQueueService: LocationQueueService,
    private readonly realtimeQueueService: RealtimeQueueService,
    private readonly realtimeTripService: RealtimeTripService,
  ) {}

  afterInit(server: Server): void {
    this.adapterPubClient = this.redisService.createDuplicate();
    this.adapterSubClient = this.adapterPubClient.duplicate();

    this.adapterPubClient.on('error', (err) => {
      logger.error(err, 'Socket adapter pub client error');
    });

    this.adapterSubClient.on('error', (err) => {
      logger.error(err, 'Socket adapter sub client error');
    });

    server.adapter(createAdapter(this.adapterPubClient, this.adapterSubClient));

    server.use((socket, next) => this.authenticateSocket(socket, next));

    logger.info('Realtime gateway initialized');
  }

  handleConnection(client: Socket): void {
    const { userId, role } = this.getSocketIdentity(client);

    if (!userId) {
      client.disconnect(true);
      return;
    }

    logger.info(`User ${userId} (${role ?? 'user'}) connected`);

    void client.join(CHANNELS.USER(userId));

    if (role) {
      void client.join(role);
    }
  }

  handleDisconnect(client: Socket): void {
    const { userId } = this.getSocketIdentity(client);
    if (userId) {
      logger.info(`User ${userId} disconnected`);
    }
  }

  emitToChannel(channel: string, event: string, data: unknown): void {
    this.server.to(channel).emit(event, data);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channel: string,
  ): void {
    const { userId } = this.getSocketIdentity(socket);
    if (!userId || !channel) {
      return;
    }

    void socket.join(channel);
    logger.info(`User ${userId} joined channel ${channel}`);
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channel: string,
  ): void {
    const { userId } = this.getSocketIdentity(socket);
    if (!userId || !channel) {
      return;
    }

    void socket.leave(channel);
    logger.info(`User ${userId} left channel ${channel}`);
  }

  @SubscribeMessage(EVENTS.DRIVER_REQUESTS_SYNC)
  async handleDriverRequestsSync(
    @ConnectedSocket() socket: Socket,
  ): Promise<WsAck<unknown[]>> {
    const { userId } = this.getSocketIdentity(socket);

    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      const requests =
        await this.realtimeTripService.getPendingRequestsForDriver(userId);

      return {
        success: true,
        data: requests,
      };
    } catch (error) {
      logger.error(error, `Failed syncing driver requests for ${userId}`);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to sync driver requests',
      };
    }
  }

  @SubscribeMessage(EVENTS.DRIVER_QUEUE_STATUS_SYNC)
  async handleDriverQueueStatusSync(
    @ConnectedSocket() socket: Socket,
  ): Promise<WsAck<unknown>> {
    const { userId } = this.getSocketIdentity(socket);

    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      const queueStatus =
        await this.realtimeQueueService.getQueueStatus(userId);

      return {
        success: true,
        data: queueStatus,
      };
    } catch (error) {
      logger.error(error, `Failed syncing queue status for ${userId}`);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to sync queue status',
      };
    }
  }

  @SubscribeMessage(EVENTS.DRIVER_QUEUE_JOIN)
  async handleDriverQueueJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: unknown,
  ): Promise<WsAck<unknown>> {
    const { userId } = this.getSocketIdentity(socket);

    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    if (!this.isDriverQueuePayload(data)) {
      return { success: false, message: 'Invalid queue payload' };
    }

    try {
      const result = await this.realtimeQueueService.joinQueue(userId, data);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error(error, `Failed joining queue for ${userId}`);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to join queue',
      };
    }
  }

  @SubscribeMessage(EVENTS.DRIVER_QUEUE_LEAVE)
  async handleDriverQueueLeave(
    @ConnectedSocket() socket: Socket,
  ): Promise<WsAck<unknown>> {
    const { userId } = this.getSocketIdentity(socket);

    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      const result = await this.realtimeQueueService.leaveQueue(userId);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error(error, `Failed leaving queue for ${userId}`);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to leave queue',
      };
    }
  }

  @SubscribeMessage(EVENTS.USER_TRIPS_SYNC)
  async handleUserTripsSync(
    @ConnectedSocket() socket: Socket,
  ): Promise<WsAck<unknown[]>> {
    const { userId } = this.getSocketIdentity(socket);

    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      const trips = await this.realtimeTripService.getUserTrips(userId);

      return {
        success: true,
        data: trips,
      };
    } catch (error) {
      logger.error(error, `Failed syncing user trips for ${userId}`);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to sync trips',
      };
    }
  }

  @SubscribeMessage(EVENTS.NOTIFICATIONS_SYNC)
  async handleNotificationsSync(
    @ConnectedSocket() socket: Socket,
  ): Promise<WsAck<RealtimeNotificationDto[]>> {
    const { userId } = this.getSocketIdentity(socket);

    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      const notifications = await this.getNotificationsForUser(userId);

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      logger.error(error, `Failed syncing notifications for ${userId}`);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to sync notifications',
      };
    }
  }

  @SubscribeMessage(EVENTS.NOTIFICATION_MARK_READ)
  async handleNotificationMarkRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: unknown,
  ): Promise<WsAck<RealtimeNotificationDto[]>> {
    const { userId } = this.getSocketIdentity(socket);

    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      const notificationId = this.isNotificationMarkReadPayload(data)
        ? data.id
        : undefined;

      if (notificationId) {
        await prisma.notification.updateMany({
          where: {
            id: notificationId,
            OR: [{ userId }, { userId: 'ALL' }],
          },
          data: { isRead: true },
        });
      } else {
        await prisma.notification.updateMany({
          where: {
            OR: [{ userId }, { userId: 'ALL' }],
            isRead: false,
          },
          data: { isRead: true },
        });
      }

      const notifications = await this.getNotificationsForUser(userId);

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      logger.error(error, `Failed marking notifications as read for ${userId}`);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to mark notifications as read',
      };
    }
  }

  @SubscribeMessage(EVENTS.NOTIFICATION_SEND)
  async handleNotificationSend(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: unknown,
  ): Promise<WsAck<RealtimeNotificationDto>> {
    const { userId, role } = this.getSocketIdentity(socket);

    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    if (role !== 'admin') {
      return { success: false, message: 'Forbidden' };
    }

    if (!this.isNotificationSendPayload(data)) {
      return { success: false, message: 'Invalid notification payload' };
    }

    try {
      const targetUserId = data.userId?.trim() || 'ALL';

      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type as
            | 'INFO'
            | 'SUCCESS'
            | 'WARNING'
            | 'ERROR'
            | 'TRIP_UPDATE'
            | 'PAYMENT',
          userId: targetUserId,
          isRead: false,
        },
      });

      const dto: RealtimeNotificationDto = {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        userId: notification.userId,
        read: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        actionUrl: notification.actionUrl,
      };

      if (targetUserId === 'ALL') {
        this.server.to('notifications-global').emit('new-notification', dto);
      } else {
        this.server
          .to(CHANNELS.USER(targetUserId))
          .emit('new-notification', dto);
      }

      return {
        success: true,
        data: dto,
      };
    } catch (error) {
      logger.error(error, `Failed sending notification by ${userId}`);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send notification',
      };
    }
  }

  @SubscribeMessage(EVENTS.RIDE_REQUEST)
  async handleRideRequest(
    @MessageBody() data: unknown,
    @ConnectedSocket() socket: Socket,
  ): Promise<WsAck<unknown>> {
    const { userId } = this.getSocketIdentity(socket);
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    if (!this.isRideRequestPayload(data)) {
      return { success: false, message: 'Invalid ride request payload' };
    }

    try {
      const trip = await this.realtimeTripService.createRideRequest(
        userId,
        data,
      );

      this.server
        .to(CHANNELS.ROUTE(trip.routeId))
        .emit(EVENTS.NEW_RIDE_REQUEST, trip);
      this.server.to(CHANNELS.TRIP(trip.id)).emit(EVENTS.TRIP_UPDATED, trip);

      logger.info(`Realtime trip ${trip.id} requested by ${userId}`);

      return {
        success: true,
        data: trip,
      };
    } catch (error) {
      logger.error(
        error,
        `Failed creating realtime ride request for ${userId}`,
      );
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to request ride',
      };
    }
  }

  @SubscribeMessage(EVENTS.RIDE_ACCEPTED)
  async handleRideAccepted(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: unknown,
  ): Promise<WsAck<unknown>> {
    const { userId } = this.getSocketIdentity(socket);
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    if (!this.isRideAcceptedPayload(data)) {
      return { success: false, message: 'Invalid ride accepted payload' };
    }

    try {
      const result = await this.realtimeTripService.acceptRideRequest(
        userId,
        data,
      );

      this.server
        .to(CHANNELS.USER(result.userId))
        .emit(EVENTS.RIDE_ACCEPTED, result.updatedTrip);
      this.server.to(CHANNELS.ROUTE(result.routeId)).emit(EVENTS.RIDE_TAKEN, {
        requestId: data.requestId,
        driverId: result.driverId,
      });
      this.server
        .to(CHANNELS.TRIP(result.updatedTrip.id))
        .emit(EVENTS.TRIP_UPDATED, result.updatedTrip);

      logger.info(
        `Realtime trip ${data.requestId} accepted by driver ${result.driverId}`,
      );

      return {
        success: true,
        data: result.updatedTrip,
      };
    } catch (error) {
      logger.error(error, `Failed accepting realtime trip ${data.requestId}`);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to accept ride',
      };
    }
  }

  @SubscribeMessage(EVENTS.RIDE_DECLINED)
  async handleRideDeclined(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: unknown,
  ): Promise<WsAck<{ success: boolean; requestId: string }>> {
    const { userId } = this.getSocketIdentity(socket);
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    if (!this.isRideDeclinedPayload(data)) {
      return { success: false, message: 'Invalid ride declined payload' };
    }

    try {
      const result = await this.realtimeTripService.declineRideRequest(
        userId,
        data,
      );

      return {
        success: true,
        data: {
          success: true,
          requestId: result.requestId,
        },
      };
    } catch (error) {
      logger.error(error, `Failed declining realtime trip ${data.requestId}`);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to decline ride',
      };
    }
  }

  @SubscribeMessage(EVENTS.RIDE_STATUS_UPDATE)
  async handleRideStatusUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: unknown,
  ): Promise<WsAck<unknown>> {
    const { userId } = this.getSocketIdentity(socket);
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    if (!this.isRideStatusPayload(data)) {
      return { success: false, message: 'Invalid ride status payload' };
    }

    try {
      const updatedTrip = await this.realtimeTripService.updateRideStatus(
        userId,
        data,
      );

      this.server
        .to(CHANNELS.TRIP(updatedTrip.id))
        .emit(EVENTS.TRIP_UPDATED, updatedTrip);
      this.server
        .to(CHANNELS.USER(updatedTrip.userId))
        .emit(EVENTS.RIDE_STATUS_CHANGED, updatedTrip);

      if (updatedTrip.status === 'CANCELLED' && !updatedTrip.taxiId) {
        this.server
          .to(CHANNELS.ROUTE(updatedTrip.routeId))
          .emit(EVENTS.RIDE_TAKEN, {
            requestId: updatedTrip.id,
            driverId: null,
            status: updatedTrip.status,
          });
      }

      if (updatedTrip.taxi?.driver?.userId) {
        this.server
          .to(CHANNELS.USER(updatedTrip.taxi.driver.userId))
          .emit(EVENTS.RIDE_STATUS_CHANGED, updatedTrip);
      }

      logger.info(
        `Realtime trip ${data.rideId} status updated to ${data.status}`,
      );

      return {
        success: true,
        data: updatedTrip,
      };
    } catch (error) {
      logger.error(
        error,
        `Failed updating realtime trip status for ${data.rideId}`,
      );
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update ride status',
      };
    }
  }

  @SubscribeMessage(EVENTS.SEND_MESSAGE)
  handleSendMessage(@MessageBody() data: unknown): void {
    if (!this.isChatMessagePayload(data)) {
      return;
    }

    this.server
      .to(CHANNELS.USER(data.receiverId))
      .emit(EVENTS.NEW_MESSAGE, data);
  }

  @SubscribeMessage(EVENTS.DRIVER_LOCATION)
  async handleDriverLocation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: unknown,
  ): Promise<void> {
    const { userId } = this.getSocketIdentity(socket);

    if (!userId) {
      return;
    }

    if (!this.isDriverLocationMessage(data)) {
      return;
    }

    const hasValidCoords =
      Number.isFinite(data?.lat) && Number.isFinite(data?.lng);
    if (!data?.taxiId || !hasValidCoords) {
      return;
    }

    try {
      const activeTaxiId = await redis.get(`driver:${userId}:active_taxi`);
      const activeTaxi = typeof activeTaxiId === 'string' ? activeTaxiId : null;

      if (activeTaxi !== data.taxiId) {
        logger.warn(
          `Unauthorized location update by ${userId}: taxi ${data.taxiId}, active ${activeTaxi}`,
        );
        return;
      }

      const locationData = {
        driverId: userId,
        taxiId: data.taxiId,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading ?? 0,
        speed: data.speed ?? 0,
        timestamp: Date.now(),
      };

      await redis.set(`vehicle:${data.taxiId}:location`, locationData, {
        ex: 60,
      });

      this.server
        .to(CHANNELS.VEHICLE(data.taxiId))
        .emit(EVENTS.LOCATION_UPDATE, locationData);

      await this.locationQueueService.addLocation(locationData);
    } catch (error) {
      logger.error(error, `Error handling driver location for ${userId}`);
    }
  }

  private authenticateSocket(
    socket: Socket,
    next: (err?: Error) => void,
  ): void {
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      next(new Error('Authentication error: No token provided'));
      return;
    }

    try {
      const decoded = jwt.decode(token) as { sub?: string } | null;

      if (!decoded?.sub) {
        next(new Error('Authentication error: Invalid token structure'));
        return;
      }

      const roleQuery = socket.handshake.query.role;
      const role = Array.isArray(roleQuery)
        ? roleQuery[0]
        : (roleQuery ?? 'user');

      const socketData = socket.data as SocketData;
      socketData.userId = decoded.sub;
      socketData.role = String(role);

      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  }

  private getSocketIdentity(socket: Socket): SocketData {
    return socket.data as SocketData;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
  }

  private isRideRequestPayload(value: unknown): value is RideRequestPayload {
    if (!this.isRecord(value)) {
      return false;
    }

    const paymentMethod = value.paymentMethod;
    const hasValidPaymentMethod =
      paymentMethod === undefined ||
      (typeof paymentMethod === 'string' &&
        PAYMENT_METHODS.has(paymentMethod as PaymentMethod));

    const taxiId = value.taxiId;
    const hasValidTaxiId =
      taxiId === undefined || this.isNonEmptyString(taxiId);

    return (
      this.isNonEmptyString(value.routeId) &&
      this.isNonEmptyString(value.rankId) &&
      this.isNonEmptyString(value.pickupAddress) &&
      this.isFiniteNumber(value.pickupLat) &&
      this.isFiniteNumber(value.pickupLng) &&
      this.isNonEmptyString(value.dropoffAddress) &&
      this.isFiniteNumber(value.dropoffLat) &&
      this.isFiniteNumber(value.dropoffLng) &&
      this.isFiniteNumber(value.fare) &&
      value.fare > 0 &&
      hasValidPaymentMethod &&
      hasValidTaxiId
    );
  }

  private isRideAcceptedPayload(value: unknown): value is RideAcceptedPayload {
    return this.isRecord(value) && this.isNonEmptyString(value.requestId);
  }

  private isRideStatusPayload(value: unknown): value is RideStatusPayload {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isNonEmptyString(value.rideId) &&
      typeof value.status === 'string' &&
      TRIP_STATUSES.has(value.status as TripStatus)
    );
  }

  private isRideDeclinedPayload(value: unknown): value is RideDeclinedPayload {
    return this.isRecord(value) && this.isNonEmptyString(value.requestId);
  }

  private isChatMessagePayload(value: unknown): value is ChatMessagePayload {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isNonEmptyString(value.rideId) &&
      this.isNonEmptyString(value.message) &&
      this.isNonEmptyString(value.senderId) &&
      this.isNonEmptyString(value.receiverId)
    );
  }

  private isDriverLocationMessage(
    value: unknown,
  ): value is DriverLocationMessage {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isNonEmptyString(value.taxiId) &&
      this.isFiniteNumber(value.lat) &&
      this.isFiniteNumber(value.lng) &&
      (value.heading === undefined || this.isFiniteNumber(value.heading)) &&
      (value.speed === undefined || this.isFiniteNumber(value.speed))
    );
  }

  private isDriverQueuePayload(value: unknown): value is DriverQueuePayload {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isNonEmptyString(value.rankId) && this.isNonEmptyString(value.taxiId)
    );
  }

  private isNotificationMarkReadPayload(
    value: unknown,
  ): value is NotificationMarkReadPayload {
    if (!this.isRecord(value)) {
      return false;
    }

    return value.id === undefined || this.isNonEmptyString(value.id);
  }

  private isNotificationSendPayload(
    value: unknown,
  ): value is NotificationSendPayload {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      this.isNonEmptyString(value.title) &&
      this.isNonEmptyString(value.message) &&
      this.isNonEmptyString(value.type) &&
      (value.userId === undefined || this.isNonEmptyString(value.userId))
    );
  }

  private async getNotificationsForUser(
    userId: string,
  ): Promise<RealtimeNotificationDto[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId }, { userId: 'ALL' }],
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      userId: notification.userId,
      read: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      actionUrl: notification.actionUrl,
    }));
  }
}
