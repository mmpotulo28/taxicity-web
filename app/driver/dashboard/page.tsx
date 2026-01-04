"use client";
import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";

export default function DriverStatsPage() {
 return (
  <div className="p-6 max-w-6xl mx-auto space-y-6">
   <header>
    <h1 className="text-2xl font-bold">Driver Insights</h1>
    <p className="text-default-500">Track your performance and earnings.</p>
   </header>

   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
     <CardBody className="flex flex-row items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-full text-primary">
       <Icon icon="lucide:wallet" width={24} />
      </div>
      <div>
       <p className="text-sm text-default-500">Total Earnings</p>
       <p className="text-2xl font-bold">R0.00</p>
      </div>
     </CardBody>
    </Card>
    <Card>
     <CardBody className="flex flex-row items-center gap-4">
      <div className="p-3 bg-success/10 rounded-full text-success">
       <Icon icon="lucide:check-circle" width={24} />
      </div>
      <div>
       <p className="text-sm text-default-500">Completed Trips</p>
       <p className="text-2xl font-bold">0</p>
      </div>
     </CardBody>
    </Card>
    <Card>
     <CardBody className="flex flex-row items-center gap-4">
      <div className="p-3 bg-warning/10 rounded-full text-warning">
       <Icon icon="lucide:star" width={24} />
      </div>
      <div>
       <p className="text-sm text-default-500">Rating</p>
       <p className="text-2xl font-bold">5.0</p>
      </div>
     </CardBody>
    </Card>
   </div>

   <Card className="h-[400px] flex items-center justify-center text-default-400">
    <p>Earnings chart coming soon...</p>
   </Card>
  </div>
 );
}
