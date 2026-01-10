"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Pusher from "pusher-js";

interface PusherContextType {
 pusher: Pusher | null;
 subscribe: <T = unknown>(channelName: string, eventName: string, callback: (data: T) => void) => void;
 unsubscribe: (channelName: string) => void;
}

const PusherContext = createContext<PusherContextType | undefined>(undefined);

export const PusherProvider = ({ children }: { children: React.ReactNode }) => {
 const [pusher, setPusher] = useState<Pusher | null>(null);

 useEffect(() => {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
   console.warn("Pusher credentials not found in environment variables");
   return;
  }

  const pusherInstance = new Pusher(key, {
   cluster: cluster,
  });

  setPusher(pusherInstance);

  return () => {
   pusherInstance.disconnect();
  };
 }, []);

 const subscribe = <T = unknown>(channelName: string, eventName: string, callback: (data: T) => void) => {
  if (!pusher) return;
  const channel = pusher.subscribe(channelName);
  channel.bind(eventName, callback);
 };

 const unsubscribe = (channelName: string) => {
  if (!pusher) return;
  pusher.unsubscribe(channelName);
 };

 return (
  <PusherContext.Provider value={{ pusher, subscribe, unsubscribe }}>
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
