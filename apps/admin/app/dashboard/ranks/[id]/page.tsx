"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import axios from "axios";
import EditForm from "./EditForm";
import RankMapView from "@/components/RankMapView";

interface PageProps {
 params: Promise<{ id: string }>;
}

interface RankData {
 id: string;
 name: string;
 city: string;
 province: string;
 isActive: boolean;
 address: string;
 region: string;
 description: string | null;
 latitude: number;
 longitude: number;
 lat: number;
 lng: number;
 phone: string | null;
 operatingHours: string | null;
 image: string | null;
 capacity: number | null;
 sourceRoutes: Array<{
  id: string;
  name: string;
  distance: number;
  estimatedDuration: number;
  baseFare: number;
  status: string;
  destRank: {
   name: string;
   city: string;
  };
 }>;
 destRoutes: Array<{
  id: string;
  name: string;
  distance: number;
  estimatedDuration: number;
  baseFare: number;
  status: string;
  sourceRank: {
   name: string;
   city: string;
  };
 }>;
 _count: {
  taxiRanks: number;
  sourceRoutes: number;
  destRoutes: number;
  queueEntries: number;
  trips: number;
 };
}

export default function RankDetailsPage({ params }: PageProps) {
 const { id } = use(params);
 const [rank, setRank] = useState<RankData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const fetchRank = async () => {
   try {
    setLoading(true);
    const response = await axios.get(`/api/ranks/${id}`);
    setRank(response.data);
   } catch (err) {
    setError("Failed to load rank details");
    console.error("Error fetching rank:", err);
   } finally {
    setLoading(false);
   }
  };

  fetchRank();
 }, [id]);

 if (loading) {
  return (
   <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
   </div>
  );
 }

 if (error || !rank) {
  return (
   <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <Icon icon="lucide:alert-circle" className="text-5xl text-danger" />
    <p className="text-lg text-default-500">{error || "Rank not found"}</p>
    <Link href="/dashboard/ranks">
     <Button color="primary" variant="flat">
      Back to Ranks
     </Button>
    </Link>
   </div>
  );
 }

 const totalRoutes = rank._count.sourceRoutes + rank._count.destRoutes;

 return (
  <div className="space-y-6 max-w-7xl mx-auto p-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <div className="flex items-center gap-3">
      <h1 className="text-3xl font-bold">{rank.name}</h1>
      <Chip color={rank.isActive ? "success" : "default"} variant="flat">
       {rank.isActive ? "Active" : "Inactive"}
      </Chip>
     </div>
     <p className="text-default-500 mt-1">
      {rank.city}, {rank.province}
     </p>
    </div>
    <div className="flex gap-2">
     <Link href={`/dashboard/ranks/${rank.id}/performance`}>
      <Button variant="flat" color="primary" startContent={<Icon icon="lucide:bar-chart" />}>
       Performance
      </Button>
     </Link>
     <Link href="/dashboard/ranks">
      <Button variant="light" startContent={<Icon icon="lucide:arrow-left" />}>
       Back
      </Button>
     </Link>
    </div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Overview Cards */}
    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
     <Card>
      <CardBody className="p-4">
       <div className="flex items-center justify-between">
        <div>
         <p className="text-sm text-default-500">Total Routes</p>
         <p className="text-2xl font-bold mt-1">{totalRoutes}</p>
        </div>
        <div className="p-3 rounded-full bg-primary-100">
         <Icon icon="lucide:route" className="text-2xl text-primary" />
        </div>
       </div>
      </CardBody>
     </Card>

     <Card>
      <CardBody className="p-4">
       <div className="flex items-center justify-between">
        <div>
         <p className="text-sm text-default-500">Total Trips</p>
         <p className="text-2xl font-bold mt-1">{rank._count.trips}</p>
        </div>
        <div className="p-3 rounded-full bg-success-100">
         <Icon icon="lucide:car" className="text-2xl text-success" />
        </div>
       </div>
      </CardBody>
     </Card>

     <Card>
      <CardBody className="p-4">
       <div className="flex items-center justify-between">
        <div>
         <p className="text-sm text-default-500">Queue Size</p>
         <p className="text-2xl font-bold mt-1">{rank._count.queueEntries}</p>
        </div>
        <div className="p-3 rounded-full bg-warning-100">
         <Icon icon="lucide:users" className="text-2xl text-warning" />
        </div>
       </div>
      </CardBody>
     </Card>

     <Card>
      <CardBody className="p-4">
       <div className="flex items-center justify-between">
        <div>
         <p className="text-sm text-default-500">Capacity</p>
         <p className="text-2xl font-bold mt-1">{rank.capacity || "N/A"}</p>
        </div>
        <div className="p-3 rounded-full bg-secondary-100">
         <Icon icon="lucide:gauge" className="text-2xl text-secondary" />
        </div>
       </div>
      </CardBody>
     </Card>
    </div>


    <div className="lg:col-span-2 flex flex-col gap-6 w-full">
     {/* Details Card */}
     <Card className="lg:col-span-2">
      <CardHeader>
       <h2 className="text-xl font-semibold">Rank Information</h2>
      </CardHeader>
      <CardBody className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
        <div>
         <p className="text-sm text-default-500">Address</p>
         <p className="font-medium">{rank.address}</p>
        </div>
        <div>
         <p className="text-sm text-default-500">Region</p>
         <p className="font-medium">{rank.region}</p>
        </div>
        <div>
         <p className="text-sm text-default-500">City</p>
         <p className="font-medium">{rank.city}</p>
        </div>
        <div>
         <p className="text-sm text-default-500">Province</p>
         <p className="font-medium">{rank.province}</p>
        </div>
       </div>

       {rank.description && (
        <>
         <Divider />
         <div>
          <p className="text-sm text-default-500">Description</p>
          <p className="text-sm mt-1">{rank.description}</p>
         </div>
        </>
       )}

       <Divider />

       <div className="grid grid-cols-2 gap-4">
        <div>
         <p className="text-sm text-default-500">Coordinates</p>
         <p className="text-sm font-mono">
          {rank.lat}, {rank.lng}
         </p>
        </div>
        {rank.phone && (
         <div>
          <p className="text-sm text-default-500">Phone</p>
          <p className="text-sm">{rank.phone}</p>
         </div>
        )}
        {rank.operatingHours && (
         <div>
          <p className="text-sm text-default-500">Operating Hours</p>
          <p className="text-sm">{rank.operatingHours}</p>
         </div>
        )}
       </div>

       {rank.image && (
        <>
         <Divider />
         <div>
          <p className="text-sm text-default-500 mb-2">Image</p>
          <div className="relative w-full h-48">
           <Image
            src={rank.image}
            alt={rank.name}
            fill
            className="object-cover rounded-lg"
           />
          </div>
         </div>
        </>
       )}
      </CardBody>
     </Card>

     {/* Map View */}
     <Card className="lg:col-span-2">
      <CardHeader>
       <h2 className="text-xl font-semibold flex items-center gap-2">
        <Icon icon="lucide:map-pin" />
        Location Map
       </h2>
      </CardHeader>
      <CardBody className="p-0">
       <RankMapView
        lat={rank.lat}
        lng={rank.lng}
        name={rank.name}
       />
      </CardBody>
     </Card>
    </div>

    {/* Edit Form */}
    <div className="lg:col-span-1">
     <EditForm rank={rank} />
    </div>


    {/* Routes Section */}
    {totalRoutes > 0 && (
     <Card className="lg:col-span-3">
      <CardHeader>
       <h2 className="text-xl font-semibold flex items-center gap-2">
        <Icon icon="lucide:route" />
        Connected Routes
       </h2>
      </CardHeader>
      <CardBody className="space-y-4">
       {rank.sourceRoutes.length > 0 && (
        <div>
         <h3 className="text-sm font-semibold text-default-600 mb-2">
          Outbound Routes ({rank.sourceRoutes.length})
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rank.sourceRoutes.map((route) => (
           <Link key={route.id} href={`/dashboard/routes/${route.id}`}>
            <Card className="hover:bg-default-100 transition" shadow="none">
             <CardBody className="p-3">
              <div className="flex items-start justify-between">
               <div className="flex-1">
                <p className="text-sm font-medium">{route.name}</p>
                <p className="text-xs text-default-500 mt-1">
                 To {route.destRank?.name || "Unknown"}, {route.destRank?.city || ""}
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
               <Chip
                size="sm"
                color={route.status === "ACTIVE" ? "success" : "default"}
                variant="flat"
               >
                {route.status}
               </Chip>
              </div>
             </CardBody>
            </Card>
           </Link>
          ))}
         </div>
        </div>
       )}

       {rank.destRoutes.length > 0 && (
        <div>
         <h3 className="text-sm font-semibold text-default-600 mb-2">
          Inbound Routes ({rank.destRoutes.length})
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rank.destRoutes.map((route) => (
           <Link key={route.id} href={`/dashboard/routes/${route.id}`}>
            <Card className="hover:bg-default-100 transition" shadow="none">
             <CardBody className="p-3">
              <div className="flex items-start justify-between">
               <div className="flex-1">
                <p className="text-sm font-medium">{route.name}</p>
                <p className="text-xs text-default-500 mt-1">
                 From {route.sourceRank?.name || "Unknown"}, {route.sourceRank?.city || ""}
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
               <Chip
                size="sm"
                color={route.status === "ACTIVE" ? "success" : "default"}
                variant="flat"
               >
                {route.status}
               </Chip>
              </div>
             </CardBody>
            </Card>
           </Link>
          ))}
         </div>
        </div>
       )}
      </CardBody>
     </Card>
    )}
   </div>
  </div>
 );
}
