"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";

interface PusherContextType {
 pusher: Socket | null;
 subscribe: (channelName: string, eventName: string, callback: (data: any) => void) => void;
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
     autoConnect: false,
     reconnection: true,
     reconnectionAttempts: 5,
     reconnectionDelay: 1000,
    });

    socketInstance.connect(); // Explicitly connect since autoConnect is false

    socketInstance.on("connect", () => console.log("Socket connected:", socketInstance.id));
    socketInstance.on("connect_error", (err) => console.error("Socket connection error:", err));
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
   return;
  }
  console.log(`Subscribing to channel: ${channelName}, event: ${eventName}`);
  socket.emit("subscribe", channelName);
  socket.on(eventName, callback);
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
