"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";
import { Spinner } from "@heroui/spinner";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import axios from "axios";
import EditForm from "./EditForm";
import RankMapView from "@/components/RankMapView";
import { RankHeader } from "@/components/dashboard/RankHeader";
import { RankInfo } from "@/components/dashboard/RankInfo";
import { RankRoutes } from "@/components/dashboard/RankRoutes";
import StatsCards, { StatsCardProps } from "@/components/dashboard/StatsCards";

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

 const stats: StatsCardProps[] = [
  { title: "Total Routes", value: totalRoutes, icon: "lucide:route", color: "primary" },
  { title: "Total Trips", value: rank._count.trips, icon: "lucide:car", color: "success" },
  { title: "Queue Size", value: rank._count.queueEntries, icon: "lucide:users", color: "warning" },
  { title: "Capacity", value: rank.capacity || "N/A", icon: "lucide:gauge", color: "secondary" },
 ];

 return (
  <div className="space-y-6 max-w-7xl mx-auto p-6">
   <RankHeader id={rank.id} name={rank.name} isActive={rank.isActive} city={rank.city} province={rank.province} />

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <StatsCards stats={stats} />

    <div className="lg:col-span-2 flex flex-col gap-6 w-full">
     <RankInfo
      address={rank.address}
      region={rank.region}
      city={rank.city}
      province={rank.province}
      description={rank.description}
      lat={rank.lat}
      lng={rank.lng}
      phone={rank.phone}
      operatingHours={rank.operatingHours}
      image={rank.image}
     />

     {/* Map View */}
     <Card className="lg:col-span-2">
      <CardHeader>
       <h2 className="text-xl font-semibold flex items-center gap-2">
        <Icon icon="lucide:map-pin" />
        Location Map
       </h2>
      </CardHeader>
      <CardBody className="p-0">
       <RankMapView lat={rank.lat} lng={rank.lng} name={rank.name} />
      </CardBody>
     </Card>
    </div>

    {/* Edit Form */}
    <div className="lg:col-span-1">
     <EditForm rank={rank} />
    </div>

    <RankRoutes sourceRoutes={rank.sourceRoutes} destRoutes={rank.destRoutes} totalRoutes={totalRoutes} />
   </div>
  </div>
 );
}
