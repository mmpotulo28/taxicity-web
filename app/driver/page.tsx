"use client";

import React from "react";
import { Spinner } from "@heroui/spinner";
import { useDriver } from "@/context/DriverContext";
import { DriverConsole } from "@/components/driver/DriverConsole";
import { VehicleRegistration } from "@/components/driver/VehicleRegistration";

export default function DriverPage() {
  const { driver, isLoading, refreshDriver } = useDriver();

  if (isLoading) {
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
    return <VehicleRegistration onComplete={refreshDriver} />;
  }

  // Step 2: Driver Console (Handles Shift Start & Active Shift)
  return <DriverConsole />;
}
