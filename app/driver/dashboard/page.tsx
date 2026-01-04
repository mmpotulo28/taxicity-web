"use client";
import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { VehicleRegistration } from "@/components/driver/VehicleRegistration";
import { RouteSelection } from "@/components/driver/RouteSelection";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";

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

const DriverDashboard = () => {
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
  refetchInterval: 3000, // Poll every 3 seconds for faster updates
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
   <div className="flex justify-center items-center h-screen">
    <Spinner size="lg" />
   </div>
  );
 }

 if (!driver) {
  return (
   <div className="flex justify-center items-center h-screen">
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
  <div className="p-4 max-w-4xl mx-auto space-y-6">
   <header className="flex justify-between items-center">
    <div>
     <h1 className="text-2xl font-bold">Driver Dashboard</h1>
     <p className="text-default-500">
      Welcome back, {driver.firstName}
     </p>
    </div>
    <div className="flex items-center gap-2">
     <div className="px-3 py-1 bg-success/20 text-success rounded-full text-sm font-medium">
      Online
     </div>
     <div className="text-sm text-default-500">
      {currentTaxi.licensePlate} • {activeRoute.route.name}
     </div>
    </div>
   </header>

   <div className="grid gap-4">
    {activeTrip ? (
     <Card className="w-full border-primary border-2">
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
           size={180}
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
           <p className="font-medium">{activeTrip.pickupAddress}</p>
          </div>
          <div className="p-3 bg-default-100 rounded-lg">
           <p className="text-xs text-default-500">Dropoff</p>
           <p className="font-medium">{activeTrip.dropoffAddress}</p>
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
    ) : (
     <>
      <h2 className="text-xl font-semibold">Available Trips</h2>
      {isTripsLoading ? (
       <Spinner />
      ) : trips && trips.length > 0 ? (
       trips.map((trip) => (
        <Card key={trip.id} className="w-full">
         <CardBody className="flex flex-row justify-between items-center gap-4">
          <div className="flex-1 space-y-2">
           <div className="flex items-center gap-2">
            <Icon
             icon="lucide:map-pin"
             className="text-primary"
            />
            <span className="font-medium">
             {trip.pickupAddress}
            </span>
           </div>
           <div className="flex items-center gap-2">
            <Icon
             icon="lucide:navigation"
             className="text-secondary"
            />
            <span>{trip.dropoffAddress}</span>
           </div>
           <div className="text-sm text-default-400">
            Route: {trip.route.name}
           </div>
          </div>
          <div className="flex flex-col items-end gap-2">
           <span className="text-xl font-bold">
            R{trip.fare}
           </span>
           <Button
            color="primary"
            onClick={() =>
             acceptTripMutation.mutate(trip.id)
            }
            isLoading={acceptTripMutation.isPending}
           >
            Accept
           </Button>
          </div>
         </CardBody>
        </Card>
       ))
      ) : (
       <Card>
        <CardBody className="text-center py-8 text-default-500">
         No trips available at the moment.
        </CardBody>
       </Card>
      )}
     </>
    )}
   </div>
  </div>
 );
};

export default DriverDashboard;
