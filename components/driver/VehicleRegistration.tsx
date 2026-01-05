"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";
import { motion } from "framer-motion";
import axios from "axios";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card className="w-full shadow-medium">
        <CardHeader className="flex flex-col gap-2 items-center pt-8 pb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary">
            <Icon icon="lucide:car-front" width={32} />
          </div>
          <h2 className="text-2xl font-bold">Register Your Vehicle</h2>
          <p className="text-default-500 text-center">
            Enter your taxi details to start accepting trips.
          </p>
        </CardHeader>
        <CardBody className="p-6 pt-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Plate Number"
              placeholder="e.g. ABC 123 GP"
              value={formData.plateNumber}
              onChange={(e) =>
                setFormData({ ...formData, plateNumber: e.target.value })
              }
              variant="bordered"
              startContent={<Icon icon="lucide:hash" className="text-default-400" />}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Make"
                placeholder="e.g. Toyota"
                value={formData.make}
                onChange={(e) =>
                  setFormData({ ...formData, make: e.target.value })
                }
                variant="bordered"
                required
              />
              <Input
                label="Model"
                placeholder="e.g. Quantum"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                variant="bordered"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Color"
                placeholder="e.g. White"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                variant="bordered"
                startContent={<Icon icon="lucide:palette" className="text-default-400" />}
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
                variant="bordered"
                startContent={<Icon icon="lucide:users" className="text-default-400" />}
                required
              />
            </div>

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-semibold shadow-lg shadow-primary/20 mt-2"
              isLoading={loading}
              endContent={!loading && <Icon icon="lucide:arrow-right" />}
            >
              Register Vehicle
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
};
