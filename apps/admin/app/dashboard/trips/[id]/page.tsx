"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TripReceipt } from "@/components/dashboard/TripReceipt";

interface TripData {
 id: string;
 userId: string;
 pickupAddress: string;
 pickupLat: number;
 pickupLng: number;
 dropoffAddress: string;
 dropoffLat: number;
 dropoffLng: number;
 fare: number;
 platformFee: number | null;
 status: string;
 paymentMethod: string;
 paymentStatus: string;
 requestTime: string;
 acceptTime: string | null;
 pickupTime: string | null;
 dropoffTime: string | null;
 cancelReason: string | null;
 route: {
  id: string;
  name: string;
  sourceRank: {
   name: string;
   city: string;
  };
  destRank: {
   name: string;
   city: string;
  };
 };
 vehicleTrip: {
  driver: {
   fullName: string | null;
   firstName: string;
   lastName: string;
   phone: string;
   profileImage: string | null;
  };
  taxi: {
   model: string;
   licensePlate: string;
   color: string;
  };
 } | null;
 rating: {
  rating: number;
  comment: string | null;
 } | null;
}

function getTripStatusColor(status: string): "success" | "primary" | "warning" | "danger" | "default" {
 switch (status.toUpperCase()) {
  case "COMPLETED": return "success";
  case "IN_PROGRESS":
  case "ACCEPTED":
  case "ARRIVED_AT_PICKUP": return "primary";
  case "REQUESTED": return "warning";
  case "CANCELLED": return "danger";
  default: return "default";
 }
}

function getPaymentStatusColor(status: string): "success" | "warning" | "danger" | "default" {
 switch (status.toUpperCase()) {
  case "PAID": return "success";
  case "PENDING": return "warning";
  case "FAILED": return "danger";
  default: return "default";
 }
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = use(params);
 const router = useRouter();
 const [trip, setTrip] = useState<TripData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [actionLoading, setActionLoading] = useState(false);

 useEffect(() => {
  const fetchTrip = async () => {
   try {
    setLoading(true);
    const response = await axios.get(`/api/trips/${id}`);
    setTrip(response.data);
   } catch (err) {
    setError("Failed to load trip details");
    console.error("Error fetching trip:", err);
   } finally {
    setLoading(false);
   }
  };

  fetchTrip();
 }, [id]);

 const handleCancelTrip = async () => {
  if (!confirm("Are you sure you want to cancel this trip?")) return;

  try {
   setActionLoading(true);
   await axios.patch(`/api/trips/${id}/status`, { status: "CANCELLED" });
   // Refresh trip data
   const response = await axios.get(`/api/trips/${id}`);
   setTrip(response.data);
  } catch (err) {
   console.error("Error cancelling trip:", err);
   alert("Failed to cancel trip");
  } finally {
   setActionLoading(false);
  }
 };

 const handleDownloadReceipt = async () => {
  if (!trip) return;
  setActionLoading(true);
  try {
   const element = document.getElementById(`receipt-${trip.id}`);
   if (!element) {
    console.error("Receipt element not found");
    return;
   }

   // Temporary show the element for capturing
   element.style.display = "block";
   element.style.position = "fixed";
   element.style.top = "0";
   element.style.left = "-9999px";

   const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    width: 800, // Fixed width for consistent output
   });

   // Hide it back
   element.style.display = "none";

   const imgData = canvas.toDataURL("image/png");
   const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
   });

   const imgWidth = 210; // A4 width in mm
   const pageHeight = 297; // A4 height in mm
   const imgHeight = (canvas.height * imgWidth) / canvas.width;

   pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
   pdf.save(`Receipt-Trip-${trip.id.slice(0, 8)}.pdf`);
  } catch (error) {
   console.error("Error generating PDF:", error);
  } finally {
   setActionLoading(false);
  }
 };

 if (loading) {
  return (
   <div className="flex items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
   </div>
  );
 }

 if (error || !trip) {
  return (
   <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <Icon icon="lucide:alert-circle" className="text-5xl text-danger" />
    <p className="text-lg text-default-500">{error || "Trip not found"}</p>
    <Link href="/dashboard/trips">
     <Button color="primary" variant="flat">
      Back to Trips
     </Button>
    </Link>
   </div>
  );
 }

 const driverName = trip.vehicleTrip?.driver?.fullName ||
  `${trip.vehicleTrip?.driver?.firstName || ""} ${trip.vehicleTrip?.driver?.lastName || ""}`.trim() ||
  "Unassigned";

 const duration = trip.pickupTime && trip.dropoffTime
  ? Math.round((new Date(trip.dropoffTime).getTime() - new Date(trip.pickupTime).getTime()) / 60000)
  : null;

 return (
  <div className="space-y-6 max-w-7xl mx-auto p-6">
   <header className="flex items-center justify-between">
    <div>
     <h1 className="text-3xl font-bold">Trip Details</h1>
     <p className="text-default-500 mt-1">Trip ID: {trip.id}</p>
    </div>
    <div className="flex gap-2">
     {trip.status === "COMPLETED" && (
      <Button
       color="success"
       variant="flat"
       isLoading={actionLoading}
       startContent={<Icon icon="lucide:download" />}
       onPress={handleDownloadReceipt}>
       Download Receipt
      </Button>
     )}
     {trip.status !== "COMPLETED" && trip.status !== "CANCELLED" && (
      <Button
       color="primary"
       variant="flat"
       startContent={<Icon icon="lucide:map" />}
       onPress={() => router.push(`/dashboard/trips/live-tracking?tripId=${trip.id}`)}>
       Track Live
      </Button>
     )}
     <Link href="/dashboard/trips">
      <Button variant="light" startContent={<Icon icon="lucide:arrow-left" />}>
       Back
      </Button>
     </Link>
    </div>
   </header>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Main Info Column */}
    <div className="lg:col-span-2 space-y-6">
     {/* Trip Status Alert */}
     {trip.status === "IN_PROGRESS" || trip.status === "ACCEPTED" || trip.status === "ARRIVED_AT_PICKUP" ? (
      <Card className="border-2 border-primary">
       <CardBody className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
         <Icon icon="lucide:radio" className="text-primary text-2xl animate-pulse" />
         <div>
          <p className="font-semibold">Trip in Progress</p>
          <p className="text-sm text-default-500">Driver is currently on this trip</p>
         </div>
        </div>
        <Button
         color="primary"
         size="sm"
         startContent={<Icon icon="lucide:map-pin" />}
         onPress={() => router.push(`/dashboard/trips/live-tracking?tripId=${trip.id}`)}>
         Track Now
        </Button>
       </CardBody>
      </Card>
     ) : null}

     {/* Route Information */}
     <Card>
      <CardHeader>
       <h2 className="text-xl font-semibold">Route Information</h2>
      </CardHeader>
      <CardBody className="space-y-4">
       <div className="bg-default-50 rounded-lg p-4">
        <p className="text-sm text-default-500 mb-2">Route</p>
        <p className="text-lg font-semibold">{trip.route.name}</p>
        <p className="text-sm text-default-500">
         {trip.route.sourceRank.name} → {trip.route.destRank.name}
        </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-default-50 rounded-lg p-4">
         <div className="flex items-start gap-3">
          <Icon icon="lucide:map-pin" className="text-success text-xl mt-1" />
          <div>
           <p className="text-sm text-default-500">Pickup Location</p>
           <p className="font-medium">{trip.pickupAddress}</p>
          </div>
         </div>
        </div>

        <div className="bg-default-50 rounded-lg p-4">
         <div className="flex items-start gap-3">
          <Icon icon="lucide:flag" className="text-danger text-xl mt-1" />
          <div>
           <p className="text-sm text-default-500">Dropoff Location</p>
           <p className="font-medium">{trip.dropoffAddress}</p>
          </div>
         </div>
        </div>
       </div>
      </CardBody>
     </Card>

     {/* Trip Timeline */}
     <Card>
      <CardHeader>
       <h2 className="text-xl font-semibold">Trip Timeline</h2>
      </CardHeader>
      <CardBody>
       <div className="space-y-4">
        <div className="flex gap-4">
         <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
           <Icon icon="lucide:check" className="text-white" />
          </div>
          {trip.acceptTime && <div className="w-0.5 h-full bg-default-200 my-2" />}
         </div>
         <div className="pb-4">
          <p className="font-medium">Trip Requested</p>
          <p className="text-sm text-default-500">
           {new Date(trip.requestTime).toLocaleString()}
          </p>
         </div>
        </div>

        {trip.acceptTime && (
         <div className="flex gap-4">
          <div className="flex flex-col items-center">
           <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
            <Icon icon="lucide:check" className="text-white" />
           </div>
           {trip.pickupTime && <div className="w-0.5 h-full bg-default-200 my-2" />}
          </div>
          <div className="pb-4">
           <p className="font-medium">Driver Accepted</p>
           <p className="text-sm text-default-500">
            {new Date(trip.acceptTime).toLocaleString()}
           </p>
          </div>
         </div>
        )}

        {trip.pickupTime && (
         <div className="flex gap-4">
          <div className="flex flex-col items-center">
           <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
            <Icon icon="lucide:check" className="text-white" />
           </div>
           {trip.dropoffTime && <div className="w-0.5 h-full bg-default-200 my-2" />}
          </div>
          <div className="pb-4">
           <p className="font-medium">Passenger Picked Up</p>
           <p className="text-sm text-default-500">
            {new Date(trip.pickupTime).toLocaleString()}
           </p>
          </div>
         </div>
        )}

        {trip.dropoffTime && (
         <div className="flex gap-4">
          <div className="flex flex-col items-center">
           <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
            <Icon icon="lucide:check" className="text-white" />
           </div>
          </div>
          <div>
           <p className="font-medium">Trip Completed</p>
           <p className="text-sm text-default-500">
            {new Date(trip.dropoffTime).toLocaleString()}
           </p>
           {duration && (
            <p className="text-sm text-primary font-medium mt-1">
             Duration: {duration} minutes
            </p>
           )}
          </div>
         </div>
        )}

        {trip.status === "CANCELLED" && (
         <div className="flex gap-4">
          <div className="flex flex-col items-center">
           <div className="w-8 h-8 rounded-full bg-danger flex items-center justify-center">
            <Icon icon="lucide:x" className="text-white" />
           </div>
          </div>
          <div>
           <p className="font-medium">Trip Cancelled</p>
           {trip.cancelReason && (
            <p className="text-sm text-default-500">
             Reason: {trip.cancelReason}
            </p>
           )}
          </div>
         </div>
        )}
       </div>
      </CardBody>
     </Card>

     {/* Payment & Fare */}
     <Card>
      <CardHeader>
       <h2 className="text-xl font-semibold">Payment & Fare</h2>
      </CardHeader>
      <CardBody>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-default-50 rounded-lg p-4">
         <p className="text-sm text-default-500">Total Fare</p>
         <p className="text-2xl font-bold text-success">R{Number(trip.fare).toFixed(2)}</p>
        </div>
        {trip.platformFee && (
         <div className="bg-default-50 rounded-lg p-4">
          <p className="text-sm text-default-500">Platform Fee (5%)</p>
          <p className="text-xl font-semibold">R{Number(trip.platformFee).toFixed(2)}</p>
         </div>
        )}
        <div className="bg-default-50 rounded-lg p-4">
         <p className="text-sm text-default-500 mb-2">Payment Method</p>
         <Chip
          color={trip.paymentMethod === "CASH" ? "warning" : "primary"}
          variant="flat"
          size="sm">
          {trip.paymentMethod.replace("_", " ")}
         </Chip>
        </div>
       </div>

       <div className="mt-4 bg-default-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
         <div>
          <p className="text-sm text-default-500">Payment Status</p>
          <Chip
           color={getPaymentStatusColor(trip.paymentStatus)}
           variant="flat"
           size="sm"
           className="mt-1">
           {trip.paymentStatus}
          </Chip>
         </div>
        </div>
       </div>
      </CardBody>
     </Card>

     {/* Rating */}
     {trip.rating && (
      <Card>
       <CardHeader>
        <h2 className="text-xl font-semibold">Trip Rating</h2>
       </CardHeader>
       <CardBody>
        <div className="flex items-center gap-3 mb-3">
         {[...Array(5)].map((_, i) => (
          <Icon
           key={i}
           icon={i < trip.rating!.rating ? "lucide:star" : "lucide:star"}
           className={i < trip.rating!.rating ? "text-warning" : "text-default-300"}
           style={{ fontSize: "24px" }}
          />
         ))}
         <span className="text-xl font-semibold">{trip.rating.rating}/5</span>
        </div>
        {trip.rating.comment && (
         <div className="bg-default-50 rounded-lg p-3">
          <p className="text-sm text-default-600">{trip.rating.comment}</p>
         </div>
        )}
       </CardBody>
      </Card>
     )}
    </div>

    {/* Sidebar Column */}
    <div className="space-y-6">
     {/* Trip Status Card */}
     <Card>
      <CardHeader>
       <h2 className="text-lg font-semibold">Trip Status</h2>
      </CardHeader>
      <CardBody>
       <Chip
        color={getTripStatusColor(trip.status)}
        variant="flat"
        size="lg"
        className="w-full justify-center">
        {trip.status.replace("_", " ")}
       </Chip>
      </CardBody>
     </Card>

     {/* Driver & Vehicle Info */}
     {trip.vehicleTrip && (
      <Card>
       <CardHeader>
        <h2 className="text-lg font-semibold">Driver & Vehicle</h2>
       </CardHeader>
       <CardBody className="space-y-4">
        <div className="flex items-center gap-3">
         <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center overflow-hidden">
          {trip.vehicleTrip.driver.profileImage ? (
           <img
            src={trip.vehicleTrip.driver.profileImage}
            alt={driverName}
            className="w-full h-full object-cover"
           />
          ) : (
           <Icon icon="lucide:user" className="text-3xl text-default-400" />
          )}
         </div>
         <div>
          <p className="font-semibold">{driverName}</p>
          <p className="text-sm text-default-500">{trip.vehicleTrip.driver.phone}</p>
         </div>
        </div>

        <div className="bg-default-50 rounded-lg p-3 space-y-2">
         <div className="flex justify-between">
          <span className="text-sm text-default-500">Vehicle</span>
          <span className="font-medium">{trip.vehicleTrip.taxi.model}</span>
         </div>
         <div className="flex justify-between">
          <span className="text-sm text-default-500">License Plate</span>
          <span className="font-medium">{trip.vehicleTrip.taxi.licensePlate}</span>
         </div>
         <div className="flex justify-between">
          <span className="text-sm text-default-500">Color</span>
          <span className="font-medium">{trip.vehicleTrip.taxi.color}</span>
         </div>
        </div>

        <Button
         fullWidth
         color="primary"
         variant="flat"
         startContent={<Icon icon="lucide:phone" />}>
         Contact Driver
        </Button>
       </CardBody>
      </Card>
     )}

     {/* Actions */}
     <Card>
      <CardHeader>
       <h2 className="text-lg font-semibold">Actions</h2>
      </CardHeader>
      <CardBody className="space-y-2">
       <Button
        fullWidth
        color="primary"
        variant="flat"
        isLoading={actionLoading}
        startContent={<Icon icon="lucide:printer" />}
        onPress={handleDownloadReceipt}>
        Download Receipt
       </Button>
       {trip.status !== "COMPLETED" && trip.status !== "CANCELLED" && (
        <Button
         fullWidth
         color="danger"
         variant="flat"
         startContent={<Icon icon="lucide:x" />}
         isLoading={actionLoading}
         onPress={handleCancelTrip}>
         Cancel Trip
        </Button>
       )}
      </CardBody>
     </Card>
    </div>
   </div>

   {/* Hidden Receipt Component for PDF Generation */}
   <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
    <TripReceipt trip={trip} />
   </div>
  </div>
 );
}
