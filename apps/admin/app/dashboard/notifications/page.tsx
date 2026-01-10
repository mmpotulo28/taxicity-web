"use client";
import React from "react";
import { NotificationManager } from "@/components/NotificationManager";
import { Card, CardBody } from "@heroui/react";

export default function NotificationsPage() {
    return (
        <div className="p-4 space-y-4">
             <h2 className="text-2xl font-bold">Notifications Management</h2>
             <NotificationManager />
        </div>
    );
}
