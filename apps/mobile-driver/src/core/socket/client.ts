import { io, type Socket } from "socket.io-client";

import { tokenCache } from "../auth/token-cache";
import { createReconnectDelay } from "./reconnect";
import type { DriverSocketContracts, SocketAck } from "./contracts";

let socketInstance: Socket | null = null;

export async function getDriverSocket() {
  if (socketInstance) {
    return socketInstance;
  }

  const wsUrl = process.env.EXPO_PUBLIC_WS_URL ?? "http://localhost:3006";
  const token = await tokenCache.getToken();

  socketInstance = io(wsUrl, {
    autoConnect: true,
    transports: ["websocket"],
    auth: token ? { token } : undefined,
    reconnectionDelay: createReconnectDelay(0),
    reconnectionDelayMax: createReconnectDelay(6)
  });

  return socketInstance;
}

export async function emitWithAck<TEvent extends keyof DriverSocketContracts>(
  event: TEvent,
  payload: DriverSocketContracts[TEvent]["payload"],
  timeoutMs = 5000
): Promise<DriverSocketContracts[TEvent]["ack"]> {
  const socket = await getDriverSocket();

  return await new Promise<DriverSocketContracts[TEvent]["ack"]>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Socket ack timeout for ${String(event)}`));
    }, timeoutMs);

    socket.emit(event, payload, (ack: SocketAck<DriverSocketContracts[TEvent]["ack"]> | DriverSocketContracts[TEvent]["ack"]) => {
      clearTimeout(timeout);

      if (typeof ack === "object" && ack !== null && "success" in ack) {
        const typedAck = ack as SocketAck<DriverSocketContracts[TEvent]["ack"]>;
        if (!typedAck.success) {
          reject(new Error(typedAck.message ?? "Realtime operation failed"));
          return;
        }

        resolve((typedAck.data ?? ({} as DriverSocketContracts[TEvent]["ack"])) as DriverSocketContracts[TEvent]["ack"]);
        return;
      }

      resolve(ack as DriverSocketContracts[TEvent]["ack"]);
    });
  });
}

export async function emitWithoutAck<TEvent extends keyof DriverSocketContracts>(
  event: TEvent,
  payload: DriverSocketContracts[TEvent]["payload"]
): Promise<void> {
  const socket = await getDriverSocket();
  socket.emit(event, payload);
}
