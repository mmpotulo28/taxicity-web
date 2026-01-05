"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { useDriver, Trip } from "@/context/DriverContext";
import { MapView } from "@/components/map-view";

export function DriverConsole() {
 const {
  driver,
  activeVehicleTrip,
  incomingRequests,
  startShift,
  endShift,
  acceptRequest,
  updatePassengerStatus,
 } = useDriver();

 const [selectedTaxi, setSelectedTaxi] = useState("");
 const [selectedRoute, setSelectedRoute] = useState("");

 if (!driver) return null;

 // 1. Shift Start Screen
 if (!activeVehicleTrip) {
  const availableTaxis = driver.taxis || [];
  // Get routes from the selected taxi
  const taxi = availableTaxis.find((t) => t.id === selectedTaxi);
  // Flatten routes structure if needed, assuming taxi.routes is array of { route: { id, name } }
  const availableRoutes = taxi?.routes?.map((r) => r.route) || [];

  return (
   <div className="max-w-md mx-auto p-4 space-y-6">
    <Card>
     <CardHeader>
      <h2 className="text-xl font-bold">Start Your Shift</h2>
     </CardHeader>
     <CardBody className="space-y-4">
      <Select
       label="Select Vehicle"
       placeholder="Choose a taxi"
       selectedKeys={selectedTaxi ? [selectedTaxi] : []}
       onChange={(e) => setSelectedTaxi(e.target.value)}
      >
       {availableTaxis.map((taxi) => (
        <SelectItem key={taxi.id}>
         {taxi.licensePlate} - {taxi.model}
        </SelectItem>
       ))}
      </Select>

      <Select
       label="Select Route"
       placeholder="Choose a route"
       selectedKeys={selectedRoute ? [selectedRoute] : []}
       onChange={(e) => setSelectedRoute(e.target.value)}
       isDisabled={!selectedTaxi}
      >
       {availableRoutes.map((route) => (
        <SelectItem key={route.id}>
         {route.name}
        </SelectItem>
       ))}
      </Select>

      <Button
       color="primary"
       className="w-full"
       isDisabled={!selectedTaxi || !selectedRoute}
       onPress={() => startShift(selectedTaxi, selectedRoute)}
      >
       Start Shift
      </Button>
     </CardBody>
    </Card>
   </div>
  );
 }

 // 2. Active Shift Screen
 return (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 h-[calc(100vh-80px)]">
   {/* Left Col: Manifest & Requests */}
   <div className="lg:col-span-1 space-y-6 overflow-y-auto">
    {/* Status Card */}
    <Card className="bg-primary-50 border-primary border">
     <CardBody className="flex flex-row justify-between items-center">
      <div>
       <p className="text-sm text-default-500">Current Route</p>
       <p className="font-bold">{activeVehicleTrip.route.name}</p>
      </div>
      <Button color="danger" variant="flat" size="sm" onPress={endShift}>
       End Shift
      </Button>
     </CardBody>
    </Card>

    {/* Incoming Requests */}
    <div className="space-y-2">
     <h3 className="font-semibold flex items-center gap-2">
      <Icon icon="lucide:radio" className="text-primary animate-pulse" />
      Incoming Requests ({incomingRequests.length})
     </h3>
     {incomingRequests.length === 0 && (
      <p className="text-sm text-default-400 italic">No requests nearby...</p>
     )}
     {incomingRequests.map((req) => (
      <Card key={req.id} className="border-l-4 border-l-primary">
       <CardBody className="gap-2">
        <div className="flex justify-between">
         <span className="font-semibold">New Passenger</span>
         <Chip size="sm" color="primary" variant="flat">
          R{req.fare}
         </Chip>
        </div>
        <div className="text-sm space-y-1">
         <div className="flex gap-2">
          <Icon icon="lucide:map-pin" className="text-success mt-1" />
          <span>{req.pickupAddress}</span>
         </div>
         <div className="flex gap-2">
          <Icon icon="lucide:flag" className="text-danger mt-1" />
          <span>{req.dropoffAddress}</span>
         </div>
        </div>
        <Button
         size="sm"
         color="primary"
         className="w-full mt-2"
         onPress={() => acceptRequest(req.id)}
        >
         Accept Passenger
        </Button>
       </CardBody>
      </Card>
     ))}
    </div>

    {/* Passenger Manifest */}
    <div className="space-y-2">
     <h3 className="font-semibold flex justify-between">
      <span>Passenger Manifest</span>
      <span className="text-sm text-default-500">
       {activeVehicleTrip.passengers.length} / {activeVehicleTrip.capacity}
      </span>
     </h3>
     {activeVehicleTrip.passengers.length === 0 && (
      <p className="text-sm text-default-400 italic">Vehicle is empty.</p>
     )}
     {activeVehicleTrip.passengers.map((p) => (
      <PassengerCard
       key={p.id}
       passenger={p}
       onUpdateStatus={updatePassengerStatus}
      />
     ))}
    </div>
   </div>

   {/* Right Col: Map */}
   <div className="lg:col-span-2 h-full min-h-[400px] rounded-xl overflow-hidden border border-default-200">
    <MapView
    // TODO: Pass route points and passenger locations
    />
   </div>
  </div>
 );
}

function PassengerCard({
 passenger,
 onUpdateStatus,
}: {
 passenger: Trip;
 onUpdateStatus: (id: string, status: string) => void;
}) {
 const getStatusColor = (status: string): "warning" | "primary" | "success" | "default" => {
  switch (status) {
   case "ACCEPTED":
    return "warning";
   case "ARRIVED_AT_PICKUP":
    return "primary";
   case "IN_PROGRESS":
    return "success";
   default:
    return "default";
  }
 };

 return (
  <Card>
   <CardBody className="flex flex-row justify-between items-center gap-2">
    <div className="flex-1 min-w-0">
     <div className="flex items-center gap-2 mb-1">
      <p className="font-semibold truncate">
       {passenger.user?.firstName || "Passenger"}
      </p>
      <Chip size="sm" color={getStatusColor(passenger.status)} variant="dot">
       {passenger.status.replace(/_/g, " ")}
      </Chip>
     </div>
     <p className="text-xs text-default-500 truncate">
      To: {passenger.dropoffAddress}
     </p>
    </div>

    <div className="flex flex-col gap-1">
     {passenger.status === "ACCEPTED" && (
      <Button
       size="sm"
       variant="flat"
       color="primary"
       onPress={() => onUpdateStatus(passenger.id, "ARRIVED_AT_PICKUP")}
      >
       Arrived
      </Button>
     )}
     {passenger.status === "ARRIVED_AT_PICKUP" && (
      <Button
       size="sm"
       color="success"
       className="text-white"
       onPress={() => onUpdateStatus(passenger.id, "IN_PROGRESS")}
      >
       Board
      </Button>
     )}
     {passenger.status === "IN_PROGRESS" && (
      <Button
       size="sm"
       color="default"
       variant="bordered"
       onPress={() => onUpdateStatus(passenger.id, "COMPLETED")}
      >
       Drop Off
      </Button>
     )}
    </div>
   </CardBody>
  </Card>
 );
}
