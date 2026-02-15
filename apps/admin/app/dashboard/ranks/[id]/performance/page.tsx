"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import axios from "axios";

interface PageProps {
 params: Promise<{ id: string }>;
}

interface PerformanceData {
 rank: {
  id: string;
  name: string;
  city: string;
  province: string;
  isActive: boolean;
 };
 stats: {
  trips: {
   count: number;
   avgFare: number | null;
  };
  routeCount: number;
  queueCount: number;
 };
 recentTrips: Array<{
  id: string;
  status: string;
  fare: number | null;
  createdAt: Date;
  vehicleTrip: {
   driver: {
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
   };
  } | null;
 }>;
 busiestRoutes: Array<{
  id: string;
  name: string;
  baseFare: number;
  distance: number;
  sourceRank: {
   name: string;
  };
  destRank: {
   name: string;
  };
  _count: {
   trips: number;
  };
 }>;
}

export default function RankPerformancePage({ params }: PageProps) {
 const { id } = use(params);
 const [data, setData] = useState<PerformanceData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);


 useEffect(() => {
  const fetchPerformance = async () => {
   try {
    setLoading(true);
    const response = await axios.get(`/api/ranks/${id}/performance`);
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
    <Link href="/dashboard/ranks">
     <Button color="primary" variant="flat">
      Back to Ranks
     </Button>
    </Link>
   </div>
  );
 }

 const { rank, stats, recentTrips, busiestRoutes } = data;

 const getTripStatusColor = (status: string): "success" | "primary" | "default" => {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "primary";
  return "default";
 };

 return (
  <div className="space-y-6 max-w-7xl mx-auto p-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <div className="flex items-center gap-3">
      <h1 className="text-3xl font-bold">Performance Metrics</h1>
      <Chip color={rank.isActive ? "success" : "default"} variant="flat">
       {rank.isActive ? "Active" : "Inactive"}
      </Chip>
     </div>
     <p className="text-default-500 mt-1">
      {rank.name} - {rank.city}, {rank.province}
     </p>
    </div>
    <Link href={`/dashboard/ranks/${rank.id}`}>
     <Button variant="light" startContent={<Icon icon="lucide:arrow-left" />}>
      Back to Details
     </Button>
    </Link>
   </div>

   {/* Performance Overview Cards */}
   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Card>
     <CardBody className="p-4">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-default-500">Total Trips</p>
        <p className="text-2xl font-bold mt-1">{stats.trips.count}</p>
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
        <p className="text-sm text-default-500">Avg Trip Fare</p>
        <p className="text-2xl font-bold mt-1">
         R{stats.trips.avgFare ? Number(stats.trips.avgFare).toFixed(2) : "0.00"}
        </p>
       </div>
       <div className="p-3 rounded-full bg-success-100">
        <Icon icon="lucide:banknote" className="text-2xl text-success" />
       </div>
      </div>
     </CardBody>
    </Card>

    <Card>
     <CardBody className="p-4">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-default-500">Queue Entries</p>
        <p className="text-2xl font-bold mt-1">{stats.queueCount}</p>
       </div>
       <div className="p-3 rounded-full bg-warning-100">
        <Icon icon="lucide:navigation" className="text-2xl text-warning" />
       </div>
      </div>
     </CardBody>
    </Card>

    <Card>
     <CardBody className="p-4">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-default-500">Connected Routes</p>
        <p className="text-2xl font-bold mt-1">{stats.routeCount}</p>
       </div>
       <div className="p-3 rounded-full bg-secondary-100">
        <Icon icon="lucide:route" className="text-2xl text-secondary" />
       </div>
      </div>
     </CardBody>
    </Card>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

    {/* Busiest Routes */}
    <Card>
     <CardHeader>
      <h2 className="text-xl font-semibold flex items-center gap-2">
       <Icon icon="lucide:trending-up" />
       Busiest Routes
      </h2>
     </CardHeader>
     <CardBody>
      {busiestRoutes.length === 0 ? (
       <div className="text-center py-8 text-default-500">
        <Icon icon="lucide:inbox" className="text-4xl mx-auto mb-2" />
        <p>No routes connected yet</p>
       </div>
      ) : (
       <div className="space-y-3">
        {busiestRoutes.map((route) => (
         <Link key={route.id} href={`/dashboard/routes/${route.id}`}>
          <Card className="bg-default-50/50 hover:bg-default-100 transition" shadow="none">
           <CardBody className="py-3 px-4">
            <div className="flex items-start justify-between">
             <div className="flex-1">
              <p className="text-sm font-medium">{route.name}</p>
              <p className="text-xs text-default-500 mt-1">
               {route.sourceRank?.name || "Unknown"} → {route.destRank?.name || "Unknown"}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
               <span className="flex items-center gap-1">
                <Icon icon="lucide:navigation" className="w-3 h-3" />
                {route.distance} km
               </span>
               <span className="flex items-center gap-1 text-success">
                <Icon icon="lucide:banknote" className="w-3 h-3" />
                R{Number(route.baseFare).toFixed(2)}
               </span>
              </div>
             </div>
             <Chip size="sm" color="primary" variant="flat">
              {route._count.trips} trips
             </Chip>
            </div>
           </CardBody>
          </Card>
         </Link>
        ))}
       </div>
      )}
     </CardBody>
    </Card>

    {/* Queue Statistics */}
    <Card className="lg:col-span-2">
     <CardHeader>
      <h2 className="text-xl font-semibold flex items-center gap-2">
       <Icon icon="lucide:users" />
       Queue Statistics
      </h2>
     </CardHeader>
     <CardBody>
      <div className="flex items-center gap-4">
       <div className="p-4 rounded-full bg-warning-100">
        <Icon icon="lucide:list-ordered" className="text-3xl text-warning" />
       </div>
       <div>
        <p className="text-sm text-default-500">Total Queue Entries</p>
        <p className="text-3xl font-bold">{stats.queueCount}</p>
       </div>
      </div>

      {stats.queueCount === 0 && (
       <div className="mt-6 text-center py-4 bg-default-100 rounded-lg">
        <p className="text-sm text-default-500">No queue data available yet</p>
       </div>
      )}
     </CardBody>
    </Card>
   </div>
  </div>
 );
}
