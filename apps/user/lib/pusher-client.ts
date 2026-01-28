import { io, Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3006";

class SocketPusherClient {
	private socket: Socket;

	constructor() {
		this.socket = io(WS_URL, {
			autoConnect: false,
		});
	}

	authenticate(token: string) {
		this.socket.auth = { token };
		this.socket.connect();
	}

	subscribe(channel: string) {
		if (this.socket.connected) {
			this.socket.emit("subscribe", channel);
		} else {
			this.socket.once("connect", () => {
				this.socket.emit("subscribe", channel);
			});
		}

		return {
			bind: (event: string, callback: (data: any) => void) => {
				this.socket.on(event, callback);
				return this;
			},
			unbind: (event: string) => {
				this.socket.off(event);
				return this;
			},
		};
	}

	unsubscribe(channel: string) {
		this.socket.emit("unsubscribe", channel); // Server handles this
	}
}

export const pusherClient = new SocketPusherClient();
