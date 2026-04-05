import { io } from "socket.io-client";

const socket = io("wss://ws.taxyciti.net", {
	transports: ["websocket"], // Force WebSocket transport
});

socket.on("connect", () => {
	console.log("✅ Connected to Socket.IO server!");
	socket.close();
});

socket.on("connect_error", (err) => {
	console.error("❌ Connection Error:", err.message);
	// socket.io usually gives better error messages
});

socket.on("disconnect", (reason) => {
	console.log("⚠️ Disconnected:", reason);
});
