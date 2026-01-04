"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import axios from "axios";
import { addToast } from "@heroui/toast";

interface VehicleRegistrationProps {
 onComplete: () => void;
}

export const VehicleRegistration: React.FC<VehicleRegistrationProps> = ({
 onComplete,
}) => {
 const [loading, setLoading] = useState(false);
 const [formData, setFormData] = useState({
  plateNumber: "",
  model: "",
  make: "",
  color: "",
  seats: "15",
 });

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
   await axios.post("/api/driver/vehicle", formData);
   addToast({
    title: "Success",
    description: "Vehicle registered successfully",
    color: "success",
   });
   onComplete();
  } catch (error) {
   console.error(error);
   addToast({
    title: "Error",
    description: "Failed to register vehicle",
    color: "danger",
   });
  } finally {
   setLoading(false);
  }
 };

 return (
  <Card className="w-full max-w-md mx-auto mt-10">
   <CardHeader className="flex flex-col gap-2">
    <h1 className="text-2xl font-bold">Register Your Vehicle</h1>
    <p className="text-default-500">
     Enter your taxi details to start accepting trips.
    </p>
   </CardHeader>
   <CardBody>
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
     <Input
      label="Plate Number"
      placeholder="e.g. ABC 123 GP"
      value={formData.plateNumber}
      onChange={(e) =>
       setFormData({ ...formData, plateNumber: e.target.value })
      }
      required
     />
     <Input
      label="Vehicle Make"
      placeholder="e.g. Toyota"
      value={formData.make}
      onChange={(e) =>
       setFormData({ ...formData, make: e.target.value })
      }
      required
     />
     <Input
      label="Vehicle Model"
      placeholder="e.g. Quantum"
      value={formData.model}
      onChange={(e) =>
       setFormData({ ...formData, model: e.target.value })
      }
      required
     />
     <Input
      label="Color"
      placeholder="e.g. White"
      value={formData.color}
      onChange={(e) =>
       setFormData({ ...formData, color: e.target.value })
      }
      required
     />
     <Input
      label="Seats"
      type="number"
      placeholder="15"
      value={formData.seats}
      onChange={(e) =>
       setFormData({ ...formData, seats: e.target.value })
      }
      required
     />
     <Button color="primary" type="submit" isLoading={loading}>
      Register Vehicle
     </Button>
    </form>
   </CardBody>
  </Card>
 );
};
