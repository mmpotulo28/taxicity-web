// Replacement for Pusher server-side client using our custom WebSocket Server

const WS_URL = process.env.WEBSOCKET_URL || "http://localhost:3006";
const WS_KEY = process.env.WS_INTERNAL_API_KEY || "taxicity-secret-key";

class WebSocketServerClient {
	async trigger(channel: string | string[], event: string, data: any) {
		const channels = Array.isArray(channel) ? channel : [channel];

		const promises = channels.map(async (ch) => {
			try {
				const response = await fetch(`${WS_URL}/trigger`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-api-key": WS_KEY,
					},
					body: JSON.stringify({ channel: ch, event, data }),
				});

				if (response.ok) {
					console.log(`Successfully triggered ${event} on ${ch} to ${WS_URL}`);
				} else {
					console.error(`Failed to trigger event on ${WS_URL}: ${response.statusText}`);
					const text = await response.text();
					console.error("Response body:", text);
				}
			} catch (error) {
				console.error("Error triggering websocket event:", error);
			}
		});

		await Promise.all(promises);
	}
}

// Preserve the singleton pattern if desired, though less critical for this HTTP client
const globalForWs = globalThis as unknown as { websocketClient: WebSocketServerClient };

export const pusherServer = globalForWs.websocketClient || new WebSocketServerClient();

if (process.env.NODE_ENV !== "production") globalForWs.websocketClient = pusherServer;
