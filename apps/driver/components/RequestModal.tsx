"use client";

import React from "react";
import {
 Modal,
 ModalContent,
 ModalHeader,
 ModalBody,
 ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Trip } from "../context/DriverContext";


interface RequestModalProps {
 isOpen: boolean;
 onClose: () => void;
 request: Trip | null;
 onAccept: (tripId: string) => Promise<void>;
}

export function RequestModal({
 isOpen,
 onClose,
 request,
 onAccept,
}: RequestModalProps) {
 const [isAccepting, setIsAccepting] = React.useState(false);

 if (!request) return null;

 const handleAccept = async () => {
  setIsAccepting(true);
  try {
   await onAccept(request.id);
   onClose(); // Close modal on success
  } catch (err) {
   console.error(err);
   // Toast is handled in context
  } finally {
   setIsAccepting(false);
  }
 };

 return (
  <Modal
   isOpen={isOpen}
   onClose={onClose}
   placement="bottom"
   motionProps={{
    variants: {
     enter: {
      y: 0,
      opacity: 1,
      transition: {
       duration: 0.3,
       ease: "easeOut",
      },
     },
     exit: {
      y: 50,
      opacity: 0,
      transition: {
       duration: 0.2,
       ease: "easeIn",
      },
     },
    },
   }}
   className="m-0 sm:m-0 sm:rounded-t-xl rounded-b-none max-w-full w-full fixed bottom-0 bg-background"
   hideCloseButton
  >
   <ModalContent>
    {() => (
     <>
      <ModalHeader className="flex flex-col gap-1 border-b border-divider">
       <div className="flex justify-between items-center w-full">
        <div className="flex flex-col">
         <h3 className="text-large font-bold">New Ride Request</h3>
         <p className="text-small text-default-500">
          {request.distance ? `${request.distance} away` : "Nearby"}
         </p>
        </div>
        <div className="flex flex-col items-end">
         <h2 className="text-2xl font-bold text-success">
          R{Number(request.fare).toFixed(2)}
         </h2>
         <Chip size="sm" variant="flat" color="default">
          {request.paymentMethod.replace(/_/g, " ")}
         </Chip>
        </div>
       </div>
      </ModalHeader>
      <ModalBody className="py-6">
       <div className="flex items-center gap-3 mb-4 p-3 bg-default-50 rounded-lg">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
         {request.user?.firstName?.[0] || "U"}
        </div>
        <div>
         <p className="font-semibold">{request.user?.firstName || "Passenger"}</p>
         <div className="flex items-center gap-1 text-tiny text-default-500">
          <Icon icon="lucide:star" className="text-warning" />
          <span>{request.user?.rating || "5.0"}</span>
         </div>
        </div>
       </div>

       <div className="relative pl-6 space-y-6">
        {/* Vertical Line */}
        <div className="absolute left-[9px] top-2 bottom-4 w-0.5 bg-default-200" />

        <div className="relative">
         <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-success ring-4 ring-background z-10" />
         <p className="text-xs text-default-500 uppercase font-medium">Pick Up</p>
         <p className="text-small font-medium mt-0.5">{request.pickupAddress}</p>
        </div>

        <div className="relative">
         <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-danger ring-4 ring-background z-10" />
         <p className="text-xs text-default-500 uppercase font-medium">Drop Off</p>
         <p className="text-small font-medium mt-0.5">{request.dropoffAddress}</p>
        </div>
       </div>

       {/* Mini Map Preview could go here if we had lat/lng and a simplified component */}
      </ModalBody>
      <ModalFooter className="flex-col gap-2 pb-6 border-t border-divider">
       <Button
        color="primary"
        size="lg"
        className="w-full font-bold text-medium shadow-lg shadow-primary/20"
        isLoading={isAccepting}
        onPress={handleAccept}
       >
        Accept Ride
       </Button>
       <Button
        color="danger"
        variant="light"
        size="lg"
        className="w-full font-medium"
        onPress={onClose}
       >
        Decline
       </Button>
      </ModalFooter>
     </>
    )}
   </ModalContent>
  </Modal>
 );
}
