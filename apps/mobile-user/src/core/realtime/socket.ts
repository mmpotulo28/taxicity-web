import { io, type Socket } from "socket.io-client";
import { EVENTS } from "@taxiciti/utils";

export interface SocketConfig {
url: string;
token?: string;
role: "user" | "driver" | "admin";
}

export interface TripUpdatedPayload {
tripId: string;
status: string;
}

export interface RealtimeEvents {
	[EVENTS.TRIP_UPDATED]: TripUpdatedPayload;
	[EVENTS.NEW_MESSAGE]: { message: string; tripId: string };
}

export class SocketAdapter {
private socket: Socket;

constructor(config: SocketConfig) {
this.socket = io(config.url, {
autoConnect: false,
auth: { token: config.token || "" },
query: { role: config.role },
reconnection: true,
reconnectionAttempts: 10,
reconnectionDelay: 1000,
reconnectionDelayMax: 30000,
randomizationFactor: 0.5,
});
}

connect() {
this.socket.connect();
}

disconnect() {
this.socket.disconnect();
}

subscribe<TEvent extends keyof RealtimeEvents>(event: TEvent, callback: (payload: RealtimeEvents[TEvent]) => void): () => void {
const listener = (payload: unknown) => callback(payload as RealtimeEvents[TEvent]);
this.socket.on(event as string, listener);
return () => {
this.socket.off(event as string, listener);
};
}
}
