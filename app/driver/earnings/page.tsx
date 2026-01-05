"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { formatCurrency } from "@/lib/utils";

interface EarningStats {
 total: number;
 today: number;
 week: number;
 month: number;
 trips: Array<{
  id: string;
  startTime: string;
  endTime: string;
  route: {
   name: string;
  };
  fare: number;
  passengers: number;
  totalAmount: number;
 }>;
}

export default function DriverEarningsPage() {
 const [stats, setStats] = useState<EarningStats | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  fetchEarnings();
 }, []);

 const fetchEarnings = async () => {
  try {
   const res = await fetch("/api/driver/earnings");
   if (res.ok) {
    const data = await res.json();
    setStats(data);
   }
  } catch (error) {
   console.error("Failed to fetch earnings:", error);
  } finally {
   setLoading(false);
  }
 };

 if (loading) {
  return (
   <div className="flex justify-center items-center h-[50vh]">
    <Spinner size="lg" />
   </div>
  );
 }

 if (!stats) {
  return (
   <div className="p-4">
    <p className="text-center text-gray-500">Failed to load earnings data.</p>
   </div>
  );
 }

 return (
  <div className="p-4 pb-24 space-y-6">
   <h1 className="text-2xl font-bold">Earnings</h1>

   {/* Summary Cards */}
   <div className="grid grid-cols-2 gap-4">
    <Card className="bg-primary-50">
     <CardBody>
      <p className="text-sm text-gray-600">Today</p>
      <p className="text-2xl font-bold text-primary">
       {formatCurrency(stats.today)}
      </p>
     </CardBody>
    </Card>
    <Card>
     <CardBody>
      <p className="text-sm text-gray-600">This Week</p>
      <p className="text-2xl font-bold">
       {formatCurrency(stats.week)}
      </p>
     </CardBody>
    </Card>
    <Card>
     <CardBody>
      <p className="text-sm text-gray-600">This Month</p>
      <p className="text-2xl font-bold">
       {formatCurrency(stats.month)}
      </p>
     </CardBody>
    </Card>
    <Card>
     <CardBody>
      <p className="text-sm text-gray-600">Total All Time</p>
      <p className="text-xl font-bold">
       {formatCurrency(stats.total)}
      </p>
     </CardBody>
    </Card>
   </div>

   {/* Recent Trips */}
   <div>
    <h2 className="text-lg font-semibold mb-3">Recent Trips</h2>
    <div className="space-y-3">
     {stats.trips.length === 0 ? (
      <p className="text-gray-500 text-center py-4">No completed trips yet.</p>
     ) : (
      stats.trips.map((trip) => (
       <Card key={trip.id} className="w-full">
        <CardBody className="flex flex-row justify-between items-center">
         <div>
          <p className="font-medium">{trip.route.name}</p>
          <p className="text-xs text-gray-500">
           {new Date(trip.endTime).toLocaleDateString()} • {new Date(trip.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs text-gray-500">
           {trip.passengers} passengers
          </p>
         </div>
         <div className="text-right">
          <p className="font-bold text-success">
           {formatCurrency(trip.totalAmount)}
          </p>
         </div>
        </CardBody>
       </Card>
      ))
     )}
    </div>
   </div>
  </div>
 );
}
