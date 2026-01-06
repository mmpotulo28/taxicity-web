"use client";

import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";
import { Link } from "@heroui/link";

interface Taxi {
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
}

interface VehicleCardProps {
 taxi: Taxi;
 onEdit?: (taxi: Taxi) => void;
 onManageRoute?: (taxi: Taxi) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ taxi, onEdit, onManageRoute }) => {
 const getStatusColor = (status: string) => {
  switch (status) {
   case "AVAILABLE":
   case "ACTIVE":
    return "success";
   case "MAINTENANCE":
    return "warning";
   case "INACTIVE":
    return "danger";
   default:
    return "default";
  }
 };

 return (
  <Card className="w-full">
   <CardHeader className="flex justify-between items-start px-6 pt-6 pb-2">
    <div className="flex flex-col gap-1">
     <div className="flex items-center gap-2">
      <h3 className="text-xl font-bold">
       {taxi.make} {taxi.model}
      </h3>
      <Chip size="sm" variant="flat">
       {taxi.year}
      </Chip>
     </div>
     <p className="text-default-500 font-mono text-lg">
      {taxi.licensePlate}
     </p>
    </div>
    <Chip
     color={getStatusColor(taxi.status)}
     variant="dot"
     className="capitalize border-none"
    >
     {taxi.status.toLowerCase()}
    </Chip>
   </CardHeader>
   <Divider />
   <CardBody className="px-6 py-4">
    <div className="grid grid-cols-2 gap-4 mb-4">
     <div className="flex flex-col gap-1">
      <span className="text-tiny text-default-400 uppercase font-bold">
       Color
      </span>
      <div className="flex items-center gap-2">
       <div
        className="w-4 h-4 rounded-full border border-default-200"
        style={{ backgroundColor: taxi.color.toLowerCase() }}
       />
       <span className="capitalize">{taxi.color}</span>
      </div>
     </div>
     <div className="flex flex-col gap-1">
      <span className="text-tiny text-default-400 uppercase font-bold">
       Capacity
      </span>
      <div className="flex items-center gap-2">
       <Icon icon="lucide:users" className="text-default-500" />
       <span>{taxi.capacity} Seats</span>
      </div>
     </div>
    </div>

    {taxi.routes && taxi.routes.length > 0 && (
     <div className="mb-4">
      <span className="text-tiny text-default-400 uppercase font-bold block mb-2">
       Active Route
      </span>
      <div className="flex flex-wrap gap-2">
       {taxi.routes.map((r) => (
        <Chip
         key={r.id}
         startContent={<Icon icon="lucide:map-pin" />}
         variant="flat"
         color="secondary"
        >
         {r.route.name}
        </Chip>
       ))}
      </div>
     </div>
    )}

    <div className="flex flex-col gap-2">
     <span className="text-tiny text-default-400 uppercase font-bold">
      Documents
     </span>
     <div className="flex gap-2 flex-wrap">
      {taxi.registrationDoc ? (
       <Chip
        startContent={<Icon icon="lucide:file-check" />}
        variant="flat"
        color="success"
        size="sm"
        as={Link}
        href={taxi.registrationDoc}
        target="_blank"
        className="cursor-pointer"
       >
        Registration
       </Chip>
      ) : (
       <Chip
        startContent={<Icon icon="lucide:file-warning" />}
        variant="flat"
        color="warning"
        size="sm"
       >
        Missing Registration
       </Chip>
      )}

      {taxi.insuranceDoc ? (
       <Chip
        startContent={<Icon icon="lucide:shield-check" />}
        variant="flat"
        color="success"
        size="sm"
        as={Link}
        href={taxi.insuranceDoc}
        target="_blank"
        className="cursor-pointer"
       >
        Insurance
       </Chip>
      ) : (
       <Chip
        startContent={<Icon icon="lucide:shield-alert" />}
        variant="flat"
        color="warning"
        size="sm"
       >
        Missing Insurance
       </Chip>
      )}

      {taxi.permitDoc ? (
       <Chip
        startContent={<Icon icon="lucide:badge-check" />}
        variant="flat"
        color="success"
        size="sm"
        as={Link}
        href={taxi.permitDoc}
        target="_blank"
        className="cursor-pointer"
       >
        Permit
       </Chip>
      ) : (
       <Chip
        startContent={<Icon icon="lucide:badge-alert" />}
        variant="flat"
        color="warning"
        size="sm"
       >
        Missing Permit
       </Chip>
      )}
     </div>
    </div>
   </CardBody>
   <Divider />
   <CardFooter className="px-6 py-3 flex justify-end gap-2">
    <Button
     variant="light"
     color="secondary"
     startContent={<Icon icon="lucide:map" />}
     onPress={() => onManageRoute?.(taxi)}
    >
     Manage Route
    </Button>
    <Button
     variant="light"
     color="primary"
     startContent={<Icon icon="lucide:edit" />}
     onPress={() => onEdit?.(taxi)}
    >
     Edit Details
    </Button>
   </CardFooter>
  </Card>
 );
};
