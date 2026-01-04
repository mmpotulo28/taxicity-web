"use client";

import React, { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { useDriver } from "@/context/DriverContext";
import { VehicleRegistration } from "@/components/driver/VehicleRegistration";
import { VehicleCard } from "@/components/driver/VehicleCard";
import { RouteManagementModal } from "@/components/driver/RouteManagementModal";
import { addToast } from "@heroui/toast";

export default function DriverVehiclePage() {
 const { driver, isLoading, refreshDriver } = useDriver();
 const [showRegistration, setShowRegistration] = useState(false);
 const [selectedTaxiForRoute, setSelectedTaxiForRoute] = useState<any>(null);

 const handleEditVehicle = (taxi: any) => {
  addToast({
   title: "Coming Soon",
   description: "Vehicle editing will be available soon.",
   color: "primary",
  });
 };

 const handleManageRoute = (taxi: any) => {
  setSelectedTaxiForRoute(taxi);
 };

 if (isLoading) {
  return (
   <div className="flex justify-center items-center h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
   </div>
  );
 }

 if (!driver) {
  return <div className="p-4">Driver profile not found.</div>;
 }

 const hasVehicles = driver.taxis && driver.taxis.length > 0;

 if (showRegistration || !hasVehicles) {
  return (
   <div className="p-4 pb-24">
    <div className="flex items-center gap-2 mb-4">
     {hasVehicles && (
      <Button
       isIconOnly
       variant="light"
       onPress={() => setShowRegistration(false)}
      >
       <Icon icon="lucide:arrow-left" width={24} />
      </Button>
     )}
     <h1 className="text-2xl font-bold">Register Vehicle</h1>
    </div>
    <VehicleRegistration
     onComplete={async () => {
      setShowRegistration(false);
      await refreshDriver();
     }}
    />
   </div>
  );
 }

 return (
  <div className="p-4 pb-24">
   <div className="flex justify-between items-center mb-4">
    <h1 className="text-2xl font-bold">My Vehicles</h1>
    <Button
     color="primary"
     onPress={() => setShowRegistration(true)}
     startContent={<Icon icon="lucide:plus" />}
    >
     Add Vehicle
    </Button>
   </div>

   <div className="flex flex-col gap-4">
    {driver.taxis.map((taxi) => (
     <VehicleCard
      key={taxi.id}
      taxi={taxi}
      onEdit={handleEditVehicle}
      onManageRoute={handleManageRoute}
     />
    ))}
   </div>

   <RouteManagementModal
    isOpen={!!selectedTaxiForRoute}
    onClose={() => setSelectedTaxiForRoute(null)}
    taxiId={selectedTaxiForRoute?.id}
    currentRouteId={
     selectedTaxiForRoute?.routes?.find((r: any) => r.isActive)?.routeId
    }
    onSuccess={() => {
     refreshDriver();
     setSelectedTaxiForRoute(null);
    }}
   />
  </div>
 );
}
