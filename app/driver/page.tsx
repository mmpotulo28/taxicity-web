"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardBody, Switch, Chip, Avatar, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { MapView } from "@/components/map-view";
import { useDriver, Trip } from "@/context/DriverContext";

export default function DriverDashboard() {
 const router = useRouter();
 const { user } = useUser();
 const {
  driver,
  isOnline,
  toggleOnline,
  activeRequest,
  incomingRequests,
  acceptRequest,
  updateTripStatus,
  isLoading
 } = useDriver();

 React.useEffect(() => {
  if (!isLoading) {
   if (!driver) {
    router.push("/driver/apply");
   } else if (driver.status === "PENDING_VERIFICATION") {
    router.push("/driver/status");
   }
  }
 }, [driver, isLoading, router]);

 const handleAccept = async (req: Trip) => {
  await acceptRequest(req.id);
 };

 const handleStatusUpdate = async (status: string) => {
  if (!activeRequest) return;
  await updateTripStatus(activeRequest.id, status);
 };

 const handleComplete = async () => {
  if (!activeRequest) return;
  await updateTripStatus(activeRequest.id, "COMPLETED");
 };

 if (isLoading) {
  return (
   <div className="h-full flex items-center justify-center bg-default-100">
    <div className="animate-pulse flex flex-col items-center">
     <Icon icon="lucide:car-taxi-front" className="text-4xl text-primary mb-2" />
     <p className="font-medium text-default-500">Loading Driver Profile...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="h-full relative bg-default-100 overflow-hidden flex flex-col">
   {/* Map Background */}
   <div className="absolute inset-0 z-0">
    <MapView
     fullscreen
     showTaxis={false} // Don't show other taxis to the driver
     zIndex={0}
    />
   </div>

   {/* Top Bar */}
   <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start">
    <Card className="bg-background/90 backdrop-blur-md shadow-sm w-full">
     <CardBody className="p-3 flex flex-row justify-between items-center">
      <div className="flex items-center gap-3">
       <Badge content="" color={isOnline ? "success" : "default"} shape="circle" placement="bottom-right">
        <Avatar src={user?.imageUrl} size="sm" />
       </Badge>
       <div className="flex flex-col">
        <span className="text-sm font-bold">{isOnline ? "Online" : "Offline"}</span>
        <span className="text-[10px] text-default-500">{user?.firstName || "Driver"}</span>
       </div>
      </div>
      <div className="flex items-center gap-2">
       <span className="text-xs font-medium text-default-500">{isOnline ? "You are visible" : "Go online to start"}</span>
       <Switch
        size="sm"
        color="success"
        isSelected={isOnline}
        onValueChange={() => toggleOnline()}
        thumbIcon={({ isSelected, className }) =>
         isSelected ? (
          <Icon icon="lucide:power" className={className} />
         ) : (
          <Icon icon="lucide:power-off" className={className} />
         )
        }
       />
      </div>
     </CardBody>
    </Card>
   </div>

   {/* Bottom Panel */}
   <div className="absolute bottom-20 left-0 right-0 z-10 p-4">
    <AnimatePresence mode="wait">
     {!isOnline ? (
      <motion.div
       initial={{ y: 100, opacity: 0 }}
       animate={{ y: 0, opacity: 1 }}
       exit={{ y: 100, opacity: 0 }}
      >
       <Card className="w-full bg-background/90 backdrop-blur-md shadow-lg border-t-4 border-default-400">
        <CardBody className="p-6 text-center">
         <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:car-taxi-front" className="text-3xl text-default-500" />
         </div>
         <h2 className="text-xl font-bold mb-2">You are Offline</h2>
         <p className="text-default-500 mb-6">Go online to start receiving ride requests in your area.</p>
         <Button
          color="primary"
          size="lg"
          className="w-full font-semibold"
          onPress={() => toggleOnline()}
         >
          Go Online
         </Button>
         <Button
          variant="light"
          className="w-full mt-2"
          onPress={() => router.push("/settings")}
         >
          Back to Settings
         </Button>
        </CardBody>
       </Card>
      </motion.div>
     ) : activeRequest ? (
      <motion.div
       key="active-trip"
       initial={{ y: 100, opacity: 0 }}
       animate={{ y: 0, opacity: 1 }}
       exit={{ y: 100, opacity: 0 }}
      >
       <Card className="w-full bg-background/90 backdrop-blur-md shadow-lg border-t-4 border-primary">
        <CardBody className="p-4">
         {/* Passenger Info */}
         <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Icon icon="lucide:user" />
           </div>
           <div>
            <h3 className="font-bold">{activeRequest.user?.firstName || "Passenger"}</h3>
            <div className="flex items-center gap-1 text-warning text-xs">
             <Icon icon="lucide:star" className="fill-current" />
             <span>{activeRequest.user?.rating || "5.0"}</span>
            </div>
           </div>
          </div>
          <div className="text-right">
           <p className="text-lg font-bold text-primary">R{activeRequest.fare}</p>
           <p className="text-xs text-default-500">Cash Trip</p>
          </div>
         </div>

         <div className="space-y-4 mb-6">
          <div className="flex gap-3">
           <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-0.5 h-full bg-default-200" />
            <div className="w-2 h-2 rounded-full bg-danger" />
           </div>
           <div className="flex flex-col gap-4 flex-1">
            <div>
             <p className="text-xs text-default-500">Pickup</p>
             <p className="font-medium text-sm">{activeRequest.pickupAddress}</p>
            </div>
            <div>
             <p className="text-xs text-default-500">Dropoff</p>
             <p className="font-medium text-sm">{activeRequest.dropoffAddress}</p>
            </div>
           </div>
          </div>
         </div>

         {/* Action Buttons */}
         <div className="grid grid-cols-1 gap-2">
          {activeRequest.status === "ACCEPTED" && (
           <Button color="primary" className="w-full" onPress={() => handleStatusUpdate("ARRIVED_AT_PICKUP")}>
            Arrived at Pickup
           </Button>
          )}
          {activeRequest.status === "ARRIVED_AT_PICKUP" && (
           <Button color="success" className="w-full text-white" onPress={() => handleStatusUpdate("IN_PROGRESS")}>
            Start Trip
           </Button>
          )}
          {activeRequest.status === "IN_PROGRESS" && (
           <Button color="danger" className="w-full" onPress={handleComplete}>
            Complete Trip
           </Button>
          )}
          <Button variant="flat" onPress={() => handleStatusUpdate("CANCELLED")}>
           Cancel Trip
          </Button>
         </div>
        </CardBody>
       </Card>
      </motion.div>
     ) : (
      <motion.div
       key="requests"
       initial={{ y: 100, opacity: 0 }}
       animate={{ y: 0, opacity: 1 }}
       exit={{ y: 100, opacity: 0 }}
       className="space-y-3"
      >
       {incomingRequests.length > 0 ? (
        incomingRequests.map((req) => (
         <Card key={req.id} className="w-full bg-background/90 backdrop-blur-md shadow-lg border-l-4 border-primary">
          <CardBody className="p-4">
           <div className="flex justify-between items-start mb-3">
            <div>
             <Chip size="sm" color="primary" variant="flat" className="mb-1">New Request</Chip>
             <h3 className="font-bold text-lg">R{req.fare}</h3>
            </div>
            <div className="text-right">
             <p className="font-bold">Now</p>
             <p className="text-xs text-default-500">{req.distance || "Nearby"}</p>
            </div>
           </div>

           <div className="flex items-center gap-2 mb-4 text-sm text-default-600">
            <Icon icon="lucide:map-pin" className="text-primary" />
            <span className="truncate">{req.pickupAddress}</span>
            <Icon icon="lucide:arrow-right" className="text-default-400" />
            <span className="truncate">{req.dropoffAddress}</span>
           </div>

           <div className="flex gap-2">
            <Button className="flex-1" color="primary" onPress={() => handleAccept(req)}>
             Accept
            </Button>
            <Button className="flex-1" variant="flat" color="danger">
             Decline
            </Button>
           </div>
          </CardBody>
         </Card>
        ))
       ) : (
        <Card className="w-full bg-background/90 backdrop-blur-md shadow-sm">
         <CardBody className="p-4 text-center">
          <div className="animate-pulse flex flex-col items-center">
           <Icon icon="lucide:radar" className="text-4xl text-primary mb-2" />
           <p className="font-medium">Searching for rides...</p>
          </div>
         </CardBody>
        </Card>
       )}
      </motion.div>
     )}
    </AnimatePresence>
   </div>
  </div>
 );
}
