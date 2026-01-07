"use client";

import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { iTrip } from "../types";
import { useRide } from "../context/RideContext";

export interface TripModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trip: iTrip | null;
}

const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  onOpenChange,
  trip,
}) => {
  const router = useRouter();
  const { routes, setSelectedRoute, setPickupLocation, setDropoffLocation } = useRide();

  const onBookSimilar = () => {
    if (!trip) return;

    // Find the matching route from available routes
    const matchingRoute = routes.find(r => r.name === trip.route);

    if (matchingRoute) {
      setSelectedRoute(matchingRoute);
      setPickupLocation(trip.pickup);
      setDropoffLocation(trip.dropoff);

      onOpenChange(false);

      addToast({
        title: "Trip Details Loaded",
        description: "Please confirm your locations.",
        color: "success",
      });

      router.push("/ride/location");
    } else {
      addToast({
        title: "Route Unavailable",
        description: "This route is currently not available for booking.",
        color: "danger",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Trip Details
            </ModalHeader>
            <ModalBody>
              {trip && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{trip.route}</h3>
                      <p className="text-xs text-default-500">
                        {trip.date} • {trip.time}
                      </p>
                    </div>
                    <div className="bg-success-100 text-success-600 text-xs px-2 py-0.5 rounded-full">
                      {trip.status}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div className="w-0.5 h-10 bg-default-200" />
                      <div className="w-3 h-3 rounded-full bg-danger" />
                    </div>

                    <div className="flex-1">
                      <div className="mb-2">
                        <div className="text-sm font-medium">Pickup</div>
                        <div className="text-xs text-default-500">
                          {trip.pickup}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Drop-off</div>
                        <div className="text-xs text-default-500">
                          {trip.dropoff}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Divider className="my-2" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-2">Driver</h4>
                      <div className="flex items-center gap-2.5 bg-default-50 p-2.5 rounded-lg border border-default-100">
                        <div className="w-8 h-8 bg-default-200 rounded-full flex items-center justify-center shrink-0">
                          <Icon className="text-default-500" icon="lucide:user" />
                        </div>
                        <div className="flex flex-col overflow-hidden min-h-[50px]">
                          <span className="text-sm font-medium truncate">{trip.driver}</span>
                          <div className="flex items-center gap-1">
                            <Icon icon="lucide:star" className="text-warning text-[10px]" />
                            <span className="text-[10px] text-default-500">4.8</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-2">Vehicle</h4>
                      <div className="flex flex-col justify-center bg-default-50 p-2.5 rounded-lg border border-default-100 h-[74px]">
                        <p className="text-sm font-medium truncate capitalize mb-2">{trip.vehicle}</p>
                        <div className="flex items-center gap-1.5 opacity-70">
                          <div className="px-1.5 py-0.5 bg-default-200 rounded text-[10px] font-mono border border-default-300">
                            {trip.licensePlate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Divider className="my-2" />

                  <div>
                    <h4 className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-3">Payment</h4>
                    <div className="bg-default-50 rounded-lg p-3 border border-default-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-default-600">Total Fare</span>
                        <span className="text-base font-bold text-primary">{trip.fare}</span>
                      </div>
                      <Divider className="opacity-50" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-default-500 flex items-center gap-1">
                          <Icon icon="lucide:credit-card" /> Method
                        </span>
                        <span className="font-medium capitalize">{trip.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="pt-2">
              <Button color="danger" variant="flat" onPress={onClose} size="sm">
                Close
              </Button>
              <Button
                color="primary"
                startContent={<Icon icon="lucide:rotate-cw" />}
                onPress={onBookSimilar}
                size="sm"
                className="font-medium"
              >
                Book Again
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TripModal;
