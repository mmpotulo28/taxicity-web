"use client";
import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { motion, AnimatePresence } from "framer-motion";

import { VehicleRegistration } from "@/components/driver/VehicleRegistration";
import { RouteSelection } from "@/components/driver/RouteSelection";
import { MapView } from "@/components/map-view";

// Types
interface Trip {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  fare: number;
  status: string;
  route: {
    name: string;
  };
  taxiId?: string;
  user?: {
    firstName: string;
    rating?: number;
  };
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  taxis: {
    id: string;
    licensePlate: string;
    routes: {
      isActive: boolean;
      route: {
        id: string;
        name: string;
      };
    }[];
  }[];
}

export default function DriverPage() {
  const queryClient = useQueryClient();

  // Fetch driver profile
  const {
    data: driver,
    isLoading: isDriverLoading,
    refetch: refetchDriver,
  } = useQuery<Driver>({
    queryKey: ["driver", "me"],
    queryFn: async () => {
      const { data } = await axios.get("/api/driver/me");
      return data;
    },
  });

  // Fetch active trip
  const { data: activeTrip, refetch: refetchActiveTrip } = useQuery<Trip | null>({
    queryKey: ["driver", "active-trip"],
    queryFn: async () => {
      const { data } = await axios.get("/api/driver/trips/active");
      return data.trip;
    },
    refetchInterval: 3000,
  });

  // Fetch open trips
  const { data: trips, isLoading: isTripsLoading } = useQuery<Trip[]>({
    queryKey: ["trips", "open"],
    queryFn: async () => {
      const { data } = await axios.get("/api/trips/open");
      return data;
    },
    // Only fetch trips if driver is fully onboarded AND has no active trip
    enabled:
      !!driver &&
      driver.taxis.length > 0 &&
      driver.taxis[0].routes.some((r) => r.isActive) &&
      !activeTrip,
    refetchInterval: 3000,
  });

  const acceptTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      await axios.post(`/api/driver/trips/${tripId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", "open"] });
      refetchActiveTrip();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: string }) => {
      await axios.post(`/api/driver/trips/${tripId}/status`, { status });
    },
    onSuccess: () => {
      refetchActiveTrip();
    },
  });

  if (isDriverLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-default-100">
        <Spinner size="lg" label="Loading driver profile..." />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex justify-center items-center h-screen bg-default-100">
        <p>Driver profile not found. Please contact support.</p>
      </div>
    );
  }

  // Step 1: Vehicle Registration
  if (driver.taxis.length === 0) {
    return <VehicleRegistration onComplete={refetchDriver} />;
  }

  const currentTaxi = driver.taxis[0];
  const activeRoute = currentTaxi.routes.find((r) => r.isActive);

  // Step 2: Route Selection
  if (!activeRoute) {
    return (
      <RouteSelection taxiId={currentTaxi.id} onComplete={refetchDriver} />
    );
  }

  return (
    <div className="h-full relative bg-default-100 overflow-hidden flex flex-col">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapView
          fullscreen
          showTaxis={false}
          zIndex={0}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start">
        <Card className="bg-background/90 backdrop-blur-md shadow-sm w-full max-w-4xl mx-auto">
          <CardBody className="p-3 flex flex-row justify-between items-center">
            <div>
              <h1 className="text-lg font-bold">Driver Console</h1>
              <p className="text-xs text-default-500">
                {driver.firstName} • {currentTaxi.licensePlate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Online
              </div>
              <div className="text-xs text-default-500 hidden sm:block">
                {activeRoute.route.name}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Area (Bottom Sheet style) */}
      <div className="absolute bottom-15 left-0 right-0 z-10 p-4 max-h-[80vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTrip ? (
              <motion.div
                key="active-trip"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
              >
                <Card className="w-full bg-background/95 backdrop-blur-md shadow-lg border-t-4 border-primary">
                  <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                    <div className="flex justify-between w-full items-center mb-2">
                      <h2 className="text-xl font-bold text-primary">Current Trip</h2>
                      <Chip color={activeTrip.status === "IN_PROGRESS" ? "success" : "warning"} variant="flat">
                        {activeTrip.status.replace("_", " ")}
                      </Chip>
                    </div>
                    <p className="text-default-500 text-sm">
                      {activeTrip.status === "IN_PROGRESS"
                        ? "Heading to destination"
                        : "Waiting for passenger to scan QR code"}
                    </p>
                  </CardHeader>
                  <CardBody className="py-4">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      {/* QR Code Section */}
                      {(activeTrip.status === "ACCEPTED" || activeTrip.status === "ARRIVED_AT_PICKUP") && (
                        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center">
                          <QRCode
                            value={activeTrip.taxiId || ""}
                            size={160}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                          />
                          <p className="text-center text-xs text-black mt-2 font-mono">Scan to Board</p>
                          <p className="text-center text-[10px] text-gray-500 mt-1">Taxi ID: {activeTrip.taxiId?.slice(0, 8)}...</p>
                        </div>
                      )}

                      <div className="flex-1 space-y-4 w-full">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-default-100 rounded-lg">
                            <p className="text-xs text-default-500">Pickup</p>
                            <p className="font-medium text-sm">{activeTrip.pickupAddress}</p>
                          </div>
                          <div className="p-3 bg-default-100 rounded-lg">
                            <p className="text-xs text-default-500">Dropoff</p>
                            <p className="font-medium text-sm">{activeTrip.dropoffAddress}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                          <span className="text-sm font-medium">Fare</span>
                          <span className="text-xl font-bold text-primary">R{activeTrip.fare}</span>
                        </div>

                        <div className="flex gap-2">
                          {activeTrip.status === "ACCEPTED" && (
                            <Button
                              className="flex-1"
                              color="warning"
                              onClick={() => updateStatusMutation.mutate({ tripId: activeTrip.id, status: "ARRIVED_AT_PICKUP" })}
                              isLoading={updateStatusMutation.isPending}
                            >
                              Arrived at Pickup
                            </Button>
                          )}

                          {activeTrip.status === "IN_PROGRESS" && (
                            <Button
                              className="flex-1"
                              color="success"
                              onClick={() => updateStatusMutation.mutate({ tripId: activeTrip.id, status: "COMPLETED" })}
                              isLoading={updateStatusMutation.isPending}
                            >
                              Complete Trip
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="available-trips"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="space-y-3"
              >
                <h2 className="text-xl font-semibold text-white drop-shadow-md mb-2">Available Trips</h2>
                {isTripsLoading ? (
                  <Card className="w-full bg-background/90 backdrop-blur-md">
                    <CardBody className="flex justify-center py-8">
                      <Spinner />
                    </CardBody>
                  </Card>
                ) : trips && trips.length > 0 ? (
                  trips.map((trip) => (
                    <Card key={trip.id} className="w-full bg-background/95 backdrop-blur-md shadow-lg border-l-4 border-primary">
                      <CardBody className="flex flex-row justify-between items-center gap-4 p-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:map-pin" className="text-primary" />
                            <span className="font-medium text-sm">{trip.pickupAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon icon="lucide:navigation" className="text-secondary" />
                            <span className="text-sm">{trip.dropoffAddress}</span>
                          </div>
                          <div className="text-xs text-default-400">
                            Route: {trip.route.name}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xl font-bold text-primary">R{trip.fare}</span>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => acceptTripMutation.mutate(trip.id)}
                            isLoading={acceptTripMutation.isPending}
                          >
                            Accept
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))
                ) : (
                  <Card className="w-full bg-background/90 backdrop-blur-md">
                    <CardBody className="text-center py-8 text-default-500 flex flex-col items-center">
                      <Icon icon="lucide:radar" className="text-4xl text-primary mb-2 animate-pulse" />
                      <p>Searching for passengers...</p>
                    </CardBody>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
