# TaxiCity WebSocket Server

This is a Socket.IO-based WebSocket server that replaces Pusher for realtime updates in the TaxiCity app.

## Features

- **Clerk Authentication**: Uses Clerk JWT tokens for secure connections via JWKS verification
- **Realtime Events**: Handles ride requests, driver updates, chat messages, etc.
- **Rooms**: User-specific and role-based rooms for efficient broadcasting
- **Docker Support**: Ready for containerized deployment

## Authentication

The server uses Clerk's JWT tokens for authentication. Socket.IO clients must provide a valid Clerk session token in the handshake:

```javascript
import io from "socket.io-client";

const socket = io("https://your-domain.com", {
	auth: {
		token: clerkSessionToken, // Get from Clerk's useAuth() hook
	},
});
```

## Events

### Client → Server

- `ride-request`: User requests a ride
- `accept-ride`: Driver accepts a ride
- `driver-location`: Driver sends location updates
- `ride-status-update`: Update ride status
- `send-message`: Send chat message

### Server → Client

- `new-ride-request`: Broadcast to drivers
- `ride-accepted`: Notify user of acceptance
- `ride-taken`: Notify other drivers
- `driver-location-update`: Send location to users
- `ride-status-changed`: Status updates
- `new-message`: Chat messages

## Setup

1. Install dependencies:

    ```bash
    cd apps/websocket-server
    pnpm install
    ```

2. Development:

    ```bash
    pnpm run dev
    ```

3. Build:
    ```bash
    pnpm run build
    pnpm start
    ```

## Environment Variables

- `CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `PORT`: Server port (default: 3002)
- `NODE_ENV`: Environment (production/development)

## Docker

Build and run:

```bash
docker build -t taxyciti-websocket .
docker run -p 3002:3002 \
  -e CLERK_PUBLISHABLE_KEY=your_key \
  -e CLERK_SECRET_KEY=your_secret \
  taxyciti-websocket
```

## Nginx Configuration

Add this to your Nginx config for WebSocket proxying:

```
location /socket.io/ {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Client Integration

Replace Pusher with Socket.IO client in your React/Next.js apps:

```javascript
import { useAuth } from "@clerk/clerk-react";
import io from "socket.io-client";
import { useEffect } from "react";

function useSocket() {
	const { getToken } = useAuth();

	useEffect(() => {
		const initSocket = async () => {
			const token = await getToken();
			const socket = io("https://your-domain.com", {
				auth: { token },
			});

			// Listen for events
			socket.on("new-ride-request", (data) => {
				console.log("New ride request:", data);
			});

			// Emit events
			socket.emit("ride-request", rideData);

			return () => socket.disconnect();
		};

		initSocket();
	}, [getToken]);
}
```

## API Endpoints

- `GET /health`: Protected health check endpoint (requires authentication)</content>
  <parameter name="filePath">/Users/ManelisiM/Documents/my-projects/nextjs/heroui/taxyciti-web/apps/websocket-server/README.md
