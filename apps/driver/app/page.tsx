"use client";

import React from "react";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { useDriver } from "@/context/DriverContext";
import { DriverConsole } from "@/components/DriverConsole";
import { VehicleRegistration } from "@/components/VehicleRegistration";
import { NotificationBell } from "@/components/NotificationBell";
import { motion } from "framer-motion";
import { Header } from "@taxicity/ui";

export default function DriverPage() {
  const { driver, isLoading, refreshDriver } = useDriver();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] bg-default-50 gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500 animate-pulse">Loading driver profile...</p>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] bg-default-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md space-y-4"
        >
          <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto text-danger">
            <Icon icon="lucide:alert-circle" width={40} />
          </div>
          <h2 className="text-2xl font-bold text-default-900">Profile Not Found</h2>
          <p className="text-default-500">
            We couldn&apos;t find your driver profile. If you haven&apos;t applied yet, please submit an application.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button
              as="a"
              href="/driver/apply"
              color="primary"
              startContent={<Icon icon="lucide:file-text" />}
            >
              Apply Now
            </Button>
            <Button
              as="a"
              href="/support"
              variant="bordered"
              startContent={<Icon icon="lucide:help-circle" />}
            >
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 1: Vehicle Registration
  if (driver.taxis.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-default-50 flex items-center justify-center p-4">
        <VehicleRegistration onComplete={refreshDriver} />
      </div>
    );
  }

  // Step 2: Driver Console (Handles Shift Start & Active Shift)
  return (
    <div className="min-h-[calc(100vh-64px)] max-w-lg overflow-hidden relative">

      <DriverConsole />
    </div>
  );
}
