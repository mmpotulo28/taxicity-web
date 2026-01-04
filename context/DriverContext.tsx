"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export interface Driver {
 id: string;
 firstName: string;
 lastName: string;
 status: string;
 taxis: { id: string; licensePlate: string }[];
}

export interface Trip {
 id: string;
 pickupAddress: string;
 dropoffAddress: string;
 fare: number;
 status: string;
 distance?: string; // Not in DB, calculated or mocked
 user?: {
  firstName: string;
  rating?: number;
 };
}

interface DriverContextType {
 driver: Driver | null;
 isOnline: boolean;
 activeRequest: Trip | null;
 incomingRequests: Trip[];
 isLoading: boolean;
 toggleOnline: () => Promise<void>;
 acceptRequest: (tripId: string) => Promise<void>;
 updateTripStatus: (tripId: string, status: string) => Promise<void>;
 refreshRequests: () => Promise<void>;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const DriverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { user, isLoaded } = useUser();
 const [driver, setDriver] = useState<Driver | null>(null);
 const [isOnline, setIsOnline] = useState(false);
 const [activeRequest, setActiveRequest] = useState<Trip | null>(null);
 const [incomingRequests, setIncomingRequests] = useState<Trip[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 // Fetch driver profile
 useEffect(() => {
  if (!isLoaded || !user) return;

  const fetchDriver = async () => {
   try {
    const res = await fetch("/api/driver/me");
    if (res.ok) {
     const data = await res.json();
     setDriver(data);
     // Restore online status if persisted or from DB
     if (data.status === "ACTIVE") {
      // setIsOnline(true); // Maybe don't auto-online
     }
    }
   } catch (error) {
    console.error("Failed to fetch driver:", error);
   } finally {
    setIsLoading(false);
   }
  };

  fetchDriver();
 }, [isLoaded, user]);

 // Poll for requests when online
 useEffect(() => {
  let interval: NodeJS.Timeout;

  const fetchRequests = async () => {
   if (!isOnline || !driver) return;
   try {
    const res = await fetch("/api/driver/requests");
    if (res.ok) {
     const data = await res.json();
     // Filter out active request if any
     setIncomingRequests(data);
    }
   } catch (error) {
    console.error("Failed to fetch requests:", error);
   }
  };

  if (isOnline) {
   fetchRequests(); // Initial fetch
   interval = setInterval(fetchRequests, 5000); // Poll every 5s
  } else {
   setIncomingRequests([]);
  }

  return () => clearInterval(interval);
 }, [isOnline, driver]);

 const toggleOnline = async () => {
  const newStatus = !isOnline;
  setIsOnline(newStatus);

  // Update status in DB
  if (driver) {
   try {
    await fetch("/api/driver/me", {
     method: "PATCH",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ status: newStatus ? "ACTIVE" : "INACTIVE" }),
    });
   } catch (error) {
    console.error("Failed to update status:", error);
   }
  }
 };

 const acceptRequest = async (tripId: string) => {
  try {
   const res = await fetch(`/api/driver/trips/${tripId}/accept`, {
    method: "POST",
   });
   if (res.ok) {
    const trip = await res.json();
    setActiveRequest(trip);
    setIncomingRequests((prev) => prev.filter((r) => r.id !== tripId));
   }
  } catch (error) {
   console.error("Failed to accept trip:", error);
  }
 };

 const updateTripStatus = async (tripId: string, status: string) => {
  try {
   const res = await fetch(`/api/driver/trips/${tripId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
   });
   if (res.ok) {
    const updatedTrip = await res.json();
    if (status === "COMPLETED" || status === "CANCELLED") {
     setActiveRequest(null);
    } else {
     setActiveRequest(updatedTrip);
    }
   }
  } catch (error) {
   console.error("Failed to update trip status:", error);
  }
 };

 const refreshRequests = async () => {
  if (!isOnline) return;
  const res = await fetch("/api/driver/requests");
  if (res.ok) {
   const data = await res.json();
   setIncomingRequests(data);
  }
 };

 return (
  <DriverContext.Provider
   value={{
    driver,
    isOnline,
    activeRequest,
    incomingRequests,
    isLoading,
    toggleOnline,
    acceptRequest,
    updateTripStatus,
    refreshRequests,
   }}
  >
   {children}
  </DriverContext.Provider>
 );
};

export const useDriver = () => {
 const context = useContext(DriverContext);
 if (context === undefined) {
  throw new Error("useDriver must be used within a DriverProvider");
 }
 return context;
};
