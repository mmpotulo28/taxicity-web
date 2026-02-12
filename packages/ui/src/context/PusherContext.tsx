"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";

interface PusherContextType {
 pusher: Socket | null;
 subscribe: (channelName: string, eventName: string, callback: (data: any) => void) => () => void;
 unsubscribe: (channelName: string) => void;
}

const PusherContext = createContext<PusherContextType | undefined>(undefined);

export const PusherProvider = ({ children }: { children: React.ReactNode }) => {
 const [socket, setSocket] = useState<Socket | null>(null);
 const { getToken, userId } = useAuth();

 // Manage socket connection with auth
 useEffect(() => {
  let activeSocket: Socket | null = null;

  const connect = async () => {
   if (!userId) return;

   try {
    const token = await getToken();
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3006";

    console.log("Initializing WebSocket connection to:", url);

    const socketInstance = io(url, {
     auth: { token: token || "" },
     query: { role: "user" }, // Add role hint or fetch from user metadata
     autoConnect: false,
     reconnection: true,
     reconnectionAttempts: 10,
     reconnectionDelay: 1000,
     reconnectionDelayMax: 5000,
     randomizationFactor: 0.5,
    });

    socketInstance.connect(); // Explicitly connect since autoConnect is false

    socketInstance.on("connect", () => console.log("Socket connected:", socketInstance.id));
    // socketInstance.on("connect_error", (err) => console.error("Socket connection error:", err));
    socketInstance.on("connect_error", async (err) => {
     console.error("Socket connection error:", err);
     if (err.message === "Authentication error" || err.message.includes("jwt")) {
      console.log("Attempting to refresh token...");
      try {
       // Force refresh token
       const newToken = await getToken({ skipCache: true });
       if (newToken) {
        socketInstance.auth = { token: newToken };
        socketInstance.connect();
       }
      } catch (refreshErr) {
       console.error("Failed to refresh token:", refreshErr);
      }
     }
    });

    socketInstance.on("disconnect", (reason) => console.log("Socket disconnected:", reason));

    setSocket(socketInstance);
    activeSocket = socketInstance;
   } catch (err) {
    console.error("Failed to initialize socket:", err);
   }
  };

  connect();

  return () => {
   if (activeSocket) {
    activeSocket.disconnect();
   }
  };
 }, [getToken, userId]);


 const subscribe = useCallback((channelName: string, eventName: string, callback: (data: any) => void) => {
  if (!socket) {
   console.warn("Socket not connected, cannot subscribe to:", channelName);
   return () => { };
  }
  console.log(`Subscribing to channel: ${channelName}, event: ${eventName}`);
  socket.emit("subscribe", channelName);
  socket.on(eventName, callback);

  // Return cleanup function to remove this specific listener
  return () => {
   socket.off(eventName, callback);
  };
 }, [socket]);

 const unsubscribe = useCallback((channelName: string) => {
  if (!socket) return;
  console.log(`Unsubscribing from channel: ${channelName}`);
  socket.emit("unsubscribe", channelName);
 }, [socket]);

 const value = useMemo(() => ({ pusher: socket, subscribe, unsubscribe }), [socket, subscribe, unsubscribe]);

 return (
  <PusherContext.Provider value={value}>
   {children}
  </PusherContext.Provider>
 );
};

export const usePusher = () => {
 const context = useContext(PusherContext);
 if (!context) {
  throw new Error("usePusher must be used within a PusherProvider");
 }
 return context;
};
