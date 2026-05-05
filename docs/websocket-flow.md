# WebSocket Communication Flow & Logic

This document outlines the real-time communication architecture between the User App, Driver App, and the WebSocket Server in the TaxiCity platform.

## Architecture Overview

The system uses a dedicated WebSocket Server (Socket.IO) to handle real-time events.

- **User App**: Connects as a client to request rides and track drivers.
- **Driver App**: Connects as a client to receive ride requests and broadcast location.
- **Backend API**: Sends events to the WebSocket server via an internal HTTP `/trigger` endpoint (protected by API Key).

## Authentication & Connection

### Client Connection (User/Driver App)

Clients authenticate using a Clerk session token.

1. **Client** connects to `WSS_URL`.
2. **Handshake**: Sends `token` (Clerk session token) and `role` ("user" | "driver") in auth payload/query.
3. **Server** verifies the token with Clerk.
    - If valid: Extracts `userId`.
    - Joins `user-{userId}` private room.
    - Joins `role` room (e.g., "driver" or "user"). (Note: "driver" room is used to broadcast new requests).

### Internal API Connection

The Next.js backend publishes events via HTTP to the WebSocket server.

1. **Backend** sends POST to `/trigger`.
2. **Headers**: Includes `x-api-key` (Internal Secret).
3. **Payload**: `{ channel, event, data }`.
4. **Server** validates key and broadcasts to the specified channel.

## Workflows & Logic

### 1. Ride Request Flow

**Scenario**: A passenger requests a ride.

```mermaid
sequenceDiagram
    participant U as User App
    participant WS as WebSocket Server
    participant D as Driver App (Group)

    U->>WS: Emit "ride-request" payload: { pickup, destination, userId }
    Note right of WS: Server adds timestamp & requestId
    WS->>D: Broadcast "new-ride-request" to "driver" room
    D-->>D: Display "New Ride Available" Notification
```

### 2. Ride Acceptance Flow

**Scenario**: A driver accepts a pending request.

```mermaid
sequenceDiagram
    participant D as Driver App
    participant WS as WebSocket Server
    participant U as User App
    participant OD as Other Drivers

    D->>WS: Emit "accept-ride" payload: { requestId, driverId, userId }

    par Notify Passenger
        WS->>U: Emit "ride-accepted" to room "user-{userId}"
        U-->>U: Show "Driver is on the way"
    and Notify Other Drivers
        WS->>OD: Emit "ride-taken" to room "driver"
        OD-->>OD: Remove request from list
    end
```

### 3. Live Driver Tracking Flow

**Scenario**: Driver is moving, and passenger sees the car on the map.

```mermaid
sequenceDiagram
    participant D as Driver App
    participant WS as WebSocket Server
    participant U as User App

    loop Every Few Seconds
        D->>WS: Emit "driver-location" { driverId, lat, lng }
        WS->>U: Broadcast "driver-location-update" to "user" room
        Note right of WS: In production, this should be scoped to active rides only
        U-->>U: Update Marker Position on Map
    end
```

### 4. Status Updates & Messaging

**Scenario**: Ride status changes (e.g., Arrived, Completed) or Chat.

```mermaid
sequenceDiagram
    participant U as User App
    participant WS as WebSocket Server
    participant D as Driver App

    rect rgb(240, 248, 255)
        Note over D, U: Status Update
        D->>WS: Emit "ride-status-update" { status: "arrived", userId }
        WS->>U: Emit "ride-status-changed" to "user-{userId}"
    end

    rect rgb(255, 250, 240)
        Note over D, U: Chat
        U->>WS: Emit "send-message" { message, receiverId: driverId }
        WS->>D: Emit "new-message" to "user-{driverId}"
    end
```

## Rooms & Channels Channels

| Channel / Room Name | Purpose                                                                                        | Access         |
| :------------------ | :--------------------------------------------------------------------------------------------- | :------------- |
| `user-{userId}`     | Private channel for specific user/driver. Used for direct notifications (Ride Accepted, Chat). | Private (Self) |
| `driver`            | Broadcast channel for all drivers. Used for new ride requests.                                 | Drivers Only   |
| `user`              | Broadcast channel for all users. Used for general updates (e.g., nearby drivers).              | Users Only     |

## Event API Reference

### Client -> Server Events

| Event Name           | Payload                                     | Description                          |
| :------------------- | :------------------------------------------ | :----------------------------------- |
| `ride-request`       | `{ pickup, destination, userId }`           | User requesting a vehicle.           |
| `accept-ride`        | `{ requestId, driverId, userId }`           | Driver accepting a request.          |
| `driver-location`    | `{ driverId, lat, lng }`                    | Frequent location updates.           |
| `ride-status-update` | `{ rideId, status, userId, driverId? }`     | Updates like 'started', 'completed'. |
| `send-message`       | `{ rideId, message, senderId, receiverId }` | In-ride chat.                        |
| `subscribe`          | `channelName`                               | Join a specific custom channel.      |
| `unsubscribe`        | `channelName`                               | Leave a custom channel.              |

### Server -> Client Events

| Event Name               | Target                | Description                         |
| :----------------------- | :-------------------- | :---------------------------------- |
| `new-ride-request`       | Room: `driver`        | Notification to drivers of new job. |
| `ride-accepted`          | Room: `user-{userId}` | Notify user their ride is accepted. |
| `ride-taken`             | Room: `driver`        | Tell other drivers the job is gone. |
| `driver-location-update` | Room: `user`          | Stream of driver coordinates.       |
| `ride-status-changed`    | Room: `user-{id}`     | Status change notification.         |
| `new-message`            | Room: `user-{id}`     | Incoming chat message.              |
