"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { addToast } from "@heroui/toast";
import { usePusher } from "@taxyciti/ui";
import { useDriverLocation } from "../hooks/useDriverLocation";

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  taxis: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
    year: number;
    color: string;
    capacity: number;
    status: string;
    registrationDoc?: string;
    insuranceDoc?: string;
    permitDoc?: string;
    routes?: {
      id: string;
      route: {
        id: string;
        name: string;
      };
      isActive: boolean;
    }[];
  }[];
}

export interface Trip {
  id: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  fare: number;
  status: string;
  paymentMethod: "CASH" | "QR_CODE" | "MOBILE_MONEY";
  distance?: string;
  user?: {
    firstName: string;
    rating?: number;
  };
}

export interface VehicleTrip {
  id: string;
  status: string;
  capacity: number;
  manualPassengers: number;
  passengers: Trip[];
  route: {
    id: string;
    name: string;
    baseFare: number;
    popularLocations?: {
      id: string;
      lat: number;
      lng: number;
      name: string;
    }[];
  };
  taxi: {
    id: string;
    licensePlate: string;
  };
}

interface DriverContextType {
  driver: Driver | null;
  isOnline: boolean;
  activeVehicleTrip: VehicleTrip | null;
  incomingRequests: Trip[];
  isLoading: boolean;
  currentLocation: { lat: number; lng: number; heading?: number; speed?: number } | null;
  toggleOnline: () => Promise<void>;
  startShift: (taxiId: string, routeId: string) => Promise<void>;
  endShift: () => Promise<void>;
  acceptRequest: (tripId: string) => Promise<void>;
  declineRequest: (tripId: string) => void;
  updatePassengerStatus: (tripId: string, status: string) => Promise<void>;
  updateManualPassengers: (count: number) => Promise<void>;
  refreshRequests: () => Promise<void>;
  refreshDriver: () => Promise<void>;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

export const DriverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { subscribe, unsubscribe } = usePusher();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeVehicleTrip, setActiveVehicleTrip] = useState<VehicleTrip | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { location: trackedLocation, startTracking, stopTracking, isTracking } = useDriverLocation();
  const lastLocationSync = React.useRef<number>(0);

  const currentLocation = trackedLocation
    ? {
      lat: trackedLocation.latitude,
      lng: trackedLocation.longitude,
      heading: trackedLocation.heading ?? undefined,
      speed: trackedLocation.speed ?? undefined,
    }
    : null;

  // Sync location to API (Throttled to 5s)
  useEffect(() => {
    if (!trackedLocation || !activeVehicleTrip) return;

    const now = Date.now();
    if (now - lastLocationSync.current < 5000) return;

    fetch("/api/driver/location", {
      method: "POST",
      body: JSON.stringify({
        lat: trackedLocation.latitude,
        lng: trackedLocation.longitude,
        heading: trackedLocation.heading,
        speed: trackedLocation.speed,
      }),
    }).catch((e) => console.error("Location sync failed:", e));

    lastLocationSync.current = now;
  }, [trackedLocation, activeVehicleTrip]);

  // Watch position when active
  useEffect(() => {
    if (activeVehicleTrip && !isTracking) {
      startTracking();
    } else if (!activeVehicleTrip && isTracking) {
      stopTracking();
    }
  }, [activeVehicleTrip, isTracking, startTracking, stopTracking]);

  const fetchDriver = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/driver/me");
      if (res.ok) {
        const data = await res.json();
        setDriver(data);
      }
    } catch (error) {
      console.error("Failed to fetch driver:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchActiveVehicleTrip = React.useCallback(async () => {
    if (!driver) return;
    try {
      const res = await fetch("/api/driver/vehicle-trips");
      if (res.ok) {
        const trips = await res.json();
        // Assuming we only handle one active trip at a time for now
        const active = trips.find((t: VehicleTrip) => ["BOARDING", "IN_PROGRESS"].includes(t.status));
        setActiveVehicleTrip(active || null);
        if (active) setIsOnline(true);
      }
    } catch (error) {
      console.error("Failed to fetch active vehicle trip:", error);
    }
  }, [driver]);

  // Fetch driver profile
  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchDriver();
  }, [isLoaded, user, fetchDriver]);

  // Fetch active vehicle trip when driver is loaded
  useEffect(() => {
    if (driver) {
      fetchActiveVehicleTrip();
    }
  }, [driver, fetchActiveVehicleTrip]);

  // Subscribe to Pusher updates for real-time requests and trips
  useEffect(() => {
    if (!activeVehicleTrip) return;

    const channelName = `route-${activeVehicleTrip.route.id}`;

    subscribe(channelName, "new-trip", (newTrip: Trip) => {
      console.log("New trip received via Pusher:", newTrip);
      addToast({ title: "New Ride Request", description: "A new passenger request has arrived." });
      setIncomingRequests((prev) => [newTrip, ...prev]);
    });

    subscribe(channelName, "trip-cancelled", (data: { id: string; reason?: string }) => {
      console.log("Trip cancelled/removed:", data.id);

      // Update Incoming Requests
      setIncomingRequests((prev) => prev.filter((r) => r.id !== data.id));

      // Update Active Manifest (if the passenger was already accepted)
      setActiveVehicleTrip((prev) => {
        if (!prev) return null;
        // Check if the passenger is in the current manifest
        const isPassenger = prev.passengers.some(p => p.id === data.id);

        if (isPassenger) {
          return {
            ...prev,
            passengers: prev.passengers.filter(p => p.id !== data.id)
          };
        }
        return prev;
      });

      addToast({
        title: "Request Cancelled",
        description: data.reason || "A passenger cancelled their request.",
        color: "default",
      });
    });

    return () => {
      unsubscribe(channelName);
    };
  }, [activeVehicleTrip?.route?.id, subscribe, unsubscribe]);

  // Poll for requests when online (active vehicle trip)
  // Initial fetch for requests when active (no polling, relies on Pusher)
  useEffect(() => {
    const fetchRequests = async () => {
      if (!activeVehicleTrip) return;
      try {
        const res = await fetch("/api/driver/requests");
        if (res.ok) {
          const data = await res.json();
          setIncomingRequests(data);
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      }
    };

    if (activeVehicleTrip) {
      fetchRequests(); // Initial fetch
    } else {
      setIncomingRequests([]);
    }
  }, [activeVehicleTrip?.id]);

  const toggleOnline = async () => {
    // This is now mostly controlled by start/end shift
    // But we can keep it for "Break" mode if needed
    setIsOnline(!isOnline);
  };

  const startShift = async (taxiId: string, routeId: string) => {
    try {
      const res = await fetch("/api/driver/vehicle-trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxiId, routeId }),
      });

      if (res.ok) {
        const trip = await res.json();
        setActiveVehicleTrip(trip);
        setIsOnline(true);
        addToast({
          title: "Shift Started",
          description: "You are now active on the route.",
          color: "success",
        });
      } else {
        const error = await res.json();
        throw new Error(error.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start shift";
      addToast({
        title: "Error",
        description: message,
        color: "danger",
      });
      throw error;
    }
  };

  const endShift = async () => {
    if (!activeVehicleTrip) return;
    try {
      const res = await fetch(`/api/driver/vehicle-trips/${activeVehicleTrip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (res.ok) {
        setActiveVehicleTrip(null);
        setIsOnline(false);
        addToast({
          title: "Shift Ended",
          description: "Your run has been completed.",
          color: "success",
        });
      }
    } catch (error) {
      console.error("Failed to end shift:", error);
    }
  };

  const acceptRequest = async (tripId: string) => {
    if (!activeVehicleTrip) return;

    // Find the request to get user info
    const request = incomingRequests.find((r) => r.id === tripId);

    try {
      const res = await fetch(`/api/driver/vehicle-trips/${activeVehicleTrip.id}/passengers/${tripId}/accept`, {
        method: "POST",
      });
      if (res.ok) {
        const trip = await res.json();
        // Update local state
        setActiveVehicleTrip((prev) => {
          if (!prev) return null;
          // Merge user info from request if available
          const tripWithUser = request?.user ? { ...trip, user: request.user } : trip;
          return {
            ...prev,
            passengers: [...prev.passengers, tripWithUser],
          };
        });
        setIncomingRequests((prev) => prev.filter((r) => r.id !== tripId));
        addToast({
          title: "Passenger Accepted",
          description: "Passenger added to manifest.",
          color: "success",
        });
      } else {
        const errorData = await res.json();
        addToast({
          title: "Error",
          description: errorData.error || "Failed to accept trip",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Failed to accept trip:", error);
      addToast({
        title: "Error",
        description: "An unexpected error occurred",
        color: "danger",
      });
    }
  };

  const declineRequest = (tripId: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== tripId));
  };


  const updatePassengerStatus = async (tripId: string, status: string) => {
    try {
      const res = await fetch(`/api/driver/trips/${tripId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updatedTrip = await res.json();
        // Update local state
        setActiveVehicleTrip((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            passengers: prev.passengers.map((p) => (p.id === tripId ? { ...p, ...updatedTrip } : p)),
          };
        });
      }
    } catch (error) {
      console.error("Failed to update passenger status:", error);
    }
  };

  const updateManualPassengers = async (count: number) => {
    if (!activeVehicleTrip) return;
    try {
      const res = await fetch(`/api/driver/vehicle-trips/${activeVehicleTrip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualPassengers: count }),
      });

      if (res.ok) {
        const updatedTrip = await res.json();
        setActiveVehicleTrip(prev => prev ? { ...prev, manualPassengers: updatedTrip.manualPassengers } : null);
      } else {
        throw new Error("Failed to update manual passengers");
      }
    } catch (error) {
      console.error("Failed to update manual passengers:", error);
      addToast({
        title: "Error",
        description: "Could not update passenger count.",
        color: "danger",
      });
    }
  };

  const refreshRequests = async () => {
    if (!activeVehicleTrip) return;
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
        activeVehicleTrip,
        incomingRequests,
        isLoading,
        currentLocation,
        toggleOnline,
        startShift,
        endShift,
        acceptRequest,
        declineRequest,
        updatePassengerStatus,
        updateManualPassengers,
        refreshRequests,
        refreshDriver: fetchDriver,
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
