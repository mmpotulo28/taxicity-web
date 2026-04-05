"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";

interface PerformanceData {
 route: {
  id: string;
  name: string;
  baseFare: number;
  distance: number;
  estimatedDuration: number;
  status: string;
  sourceRank: {
   name: string;
   city: string;
  };
  destRank: {
   name: string;
   city: string;
  };
 };
 stats: {
  tripCount: number;
  avgDuration: number | null;
  avgFare: number | null;
 };
 recentTrips: Array<{
  id: string;
  status: string;
  fare: number | null;
  duration: number | null;
  createdAt: Date;
  vehicleTrip: {
   driver: {
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
   };
  } | null;
 }>;
}

export default function PerformancePage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = use(params);
 const [data, setData] = useState<PerformanceData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const fetchPerformance = async () => {
   try {
    setLoading(true);
    const response = await axios.get(`/api/routes/${id}/performance`);
    setData(response.data);
   } catch (err) {
    setError("Failed to load performance data");
    console.error("Error fetching performance:", err);
   } finally {
    setLoading(false);
   }
  };

  fetchPerformance();
 }, [id]);

 if (loading) {
  return (
   <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
   </div>
  );
 }

 if (error || !data) {
  return (
   <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <Icon icon="lucide:alert-circle" className="text-5xl text-danger" />
    <p className="text-lg text-default-500">{error || "Performance data not found"}</p>
    <Link href="/dashboard/routes">
     <Button color="primary" variant="flat">
      Back to Routes
     </Button>
    </Link>
   </div>
  );
 }

 const { route, stats, recentTrips } = data;

 const getTripStatusColor = (status: string): "success" | "primary" | "default" => {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "primary";
  return "default";
 };

 return (
  <div className="space-y-6 max-w-7xl mx-auto p-6">
   <header className="flex items-center justify-between">
    <div>
     <div className="flex items-center gap-3">
      <h1 className="text-3xl font-bold">Performance Metrics</h1>
      <Chip color={route.status === "ACTIVE" ? "success" : "default"} variant="flat">
       {route.status}
      </Chip>
     </div>
     <p className="text-default-500 mt-1">
      {route.name} — {route.sourceRank.name} → {route.destRank.name}
     </p>
    </div>
    <Link href={`/dashboard/routes/${route.id}`}>
     <Button variant="light" startContent={<Icon icon="lucide:arrow-left" />}>
      Back to Details
     </Button>
    </Link>
   </header>

   {/* Performance Overview Cards */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
     <CardBody className="p-4">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-default-500">Total Trips</p>
        <p className="text-2xl font-bold mt-1">{stats.tripCount}</p>
       </div>
       <div className="p-3 rounded-full bg-primary-100">
        <Icon icon="lucide:car" className="text-2xl text-primary" />
       </div>
      </div>
     </CardBody>
    </Card>

    <Card>
     <CardBody className="p-4">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-default-500">Avg Duration</p>
        <p className="text-2xl font-bold mt-1">
         {stats.avgDuration ? (stats.avgDuration / 60).toFixed(1) : "N/A"} min
        </p>
       </div>
       <div className="p-3 rounded-full bg-warning-100">
        <Icon icon="lucide:clock" className="text-2xl text-warning" />
       </div>
      </div>
     </CardBody>
    </Card>

    <Card>
     <CardBody className="p-4">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-default-500">Avg Fare</p>
        <p className="text-2xl font-bold mt-1">
         R{stats.avgFare ? Number(stats.avgFare).toFixed(2) : "0.00"}
        </p>
       </div>
       <div className="p-3 rounded-full bg-success-100">
        <Icon icon="lucide:banknote" className="text-2xl text-success" />
       </div>
      </div>
     </CardBody>
    </Card>
   </div>

   {/* Recent Trips */}
   <Card>
    <CardHeader>
     <h2 className="text-xl font-semibold flex items-center gap-2">
      <Icon icon="lucide:clock" />
      Recent Trips
     </h2>
    </CardHeader>
    <CardBody>
     {recentTrips.length === 0 ? (
      <div className="text-center py-8 text-default-500">
       <Icon icon="lucide:inbox" className="text-4xl mx-auto mb-2" />
       <p>No trips recorded yet</p>
      </div>
     ) : (
      <div className="space-y-3">
       {recentTrips.map((trip) => (
        <Card key={trip.id} className="bg-default-50/50" shadow="none">
         <CardBody className="py-3 px-4">
          <div className="flex items-center justify-between">
           <div className="flex-1">
            <div className="flex items-center gap-2">
             <p className="text-sm font-medium">
              {trip.vehicleTrip?.driver?.fullName ||
               `${trip.vehicleTrip?.driver?.firstName || ""} ${trip.vehicleTrip?.driver?.lastName || ""}`.trim() ||
               "Unknown Driver"}
             </p>
             <Chip
              size="sm"
              color={getTripStatusColor(trip.status)}
              variant="flat"
             >
              {trip.status}
             </Chip>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-default-500">
             {trip.fare && (
              <span className="flex items-center gap-1 text-success font-medium">
               <Icon icon="lucide:banknote" className="w-3 h-3" />
               R{Number(trip.fare).toFixed(2)}
              </span>
             )}
             {trip.duration && (
              <span className="flex items-center gap-1">
               <Icon icon="lucide:clock" className="w-3 h-3" />
               {(trip.duration / 60).toFixed(1)} min
              </span>
             )}
            </div>
           </div>
           <span className="text-xs text-default-400">
            {new Date(trip.createdAt).toLocaleDateString()}
           </span>
          </div>
         </CardBody>
        </Card>
       ))}
      </div>
     )}
    </CardBody>
   </Card>
  </div>
 );
}
