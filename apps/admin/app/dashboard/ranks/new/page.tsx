"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";

interface Rank {
 id: string;
 name: string;
 address: string;
 city: string;
 province: string;
 capacity: number | null;
 isActive: boolean;
 _count?: {
  trips: number;
  sourceRoutes: number;
 };
}

export default function NewRankPage() {
 const router = useRouter();
 const [form, setForm] = useState({
  name: "",
  address: "",
  city: "",
  province: "",
  region: "",
  description: "",
  lat: "",
  lng: "",
  phone: "",
  operatingHours: "05:00 - 20:00",
  capacity: "50",
  image: "",
 });
 const [loading, setLoading] = useState(false);
 const [recentRanks, setRecentRanks] = useState<Rank[]>([]);
 const [stats, setStats] = useState({ total: 0, active: 0, avgCapacity: 0 });
 const [loadingData, setLoadingData] = useState(true);

 const handlePlaceSelected = (place: {
  address: string;
  city: string;
  province: string;
  region: string;
  lat: number;
  lng: number;
 }) => {
  setForm({
   ...form,
   address: place.address,
   city: place.city,
   province: place.province,
   region: place.region || place.city, // Fallback to city if region is empty
   lat: place.lat.toString(),
   lng: place.lng.toString(),
  });
 };

 useEffect(() => {
  const fetchData = async () => {
   try {
    const res = await fetch("/api/ranks");

    if (res.ok) {
     const ranksData: Rank[] = await res.json();
     setRecentRanks(ranksData.slice(0, 3));

     // Calculate stats
     const total = ranksData.length;
     const active = ranksData.filter((r) => r.isActive).length;
     const avgCap =
      ranksData.reduce((acc, r) => acc + (r.capacity || 0), 0) / total || 0;

     setStats({
      total,
      active,
      avgCapacity: Number(avgCap.toFixed(0)),
     });
    }
   } catch (error) {
    console.error("Failed to fetch data:", error);
   } finally {
    setLoadingData(false);
   }
  };

  fetchData();
 }, []);

 async function submit(e: React.FormEvent) {
  e.preventDefault();

  // Validation
  if (
   !form.name ||
   !form.address ||
   !form.city ||
   !form.province ||
   !form.region ||
   !form.lat ||
   !form.lng
  ) {
   alert("Please fill in all required fields");
   return;
  }

  setLoading(true);
  try {
   const res = await fetch("/api/ranks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     name: form.name,
     address: form.address,
     city: form.city,
     province: form.province,
     region: form.region,
     description: form.description || undefined,
     lat: Number.parseFloat(form.lat),
     lng: Number.parseFloat(form.lng),
     phone: form.phone || undefined,
     operatingHours: form.operatingHours || undefined,
     capacity: form.capacity ? Number.parseInt(form.capacity, 10) : undefined,
     image: form.image || undefined,
    }),
   });

   if (res.ok) {
    router.push("/dashboard/ranks");
   } else {
    const error = await res.json();
    console.error("Create failed", error);
    alert(`Failed to create rank: ${error.error || "Unknown error"}`);
   }
  } catch (err) {
   console.error("Error:", err);
   alert("An error occurred while creating the rank");
  } finally {
   setLoading(false);
  }
 }

 return (
  <div className="space-y-6 max-w-7xl mx-auto p-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-3xl font-bold">Create New Rank</h1>
     <p className="text-default-500 mt-1">Add a new taxi rank to the system</p>
    </div>
    <Link href="/dashboard/ranks">
     <Button variant="light" startContent={<Icon icon="lucide:arrow-left" />}>
      Back
     </Button>
    </Link>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Main Form */}
    <Card className="lg:col-span-2">
     <CardHeader className="flex flex-col items-start px-6 pb-0 pt-6">
      <h2 className="text-xl font-semibold">Rank Details</h2>
      <p className="text-sm text-default-500">Enter the information for the new rank</p>
     </CardHeader>
     <CardBody className="px-6 py-6">
      <form onSubmit={submit} className="space-y-6">
       {/* Basic Information */}
       <div className="space-y-4">
        <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
         <Icon icon="lucide:info" />
         Basic Information
        </h3>

        <Input
         label="Rank Name"
         placeholder="e.g., Sandton Taxi Rank"
         value={form.name}
         onChange={(e) => setForm({ ...form, name: e.target.value })}
         isRequired
         variant="bordered"
         labelPlacement="outside"
         startContent={<Icon icon="lucide:map-pin" className="text-default-400" />}
        />

        <Textarea
         label="Description (Optional)"
         placeholder="Brief description of this rank"
         value={form.description}
         onChange={(e) => setForm({ ...form, description: e.target.value })}
         variant="bordered"
         labelPlacement="outside"
         minRows={2}
         startContent={<Icon icon="lucide:file-text" className="text-default-400" />}
        />
       </div>

       <Divider />

       {/* Location Information */}
       <div className="space-y-4">
        <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
         <Icon icon="lucide:map" />
         Location
        </h3>

        {/* Google Places Autocomplete */}
        <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
         <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
           <Icon icon="lucide:sparkles" className="text-xl text-primary" />
          </div>
          <div className="flex-1">
           <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
            Quick Location Search
           </p>
           <p className="text-xs text-default-600 mb-3">
            Search for a location and we&apos;ll automatically fill in the address, city, province, and coordinates
           </p>
           <GooglePlacesAutocomplete
            onPlaceSelected={handlePlaceSelected}
            label=""
            placeholder="Search for a location (e.g., Sandton City, Johannesburg)"
           />
          </div>
         </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-default-500">
         <Divider className="flex-1" />
         <span>or enter manually</span>
         <Divider className="flex-1" />
        </div>

        <Input
         label="Address"
         placeholder="Street address"
         value={form.address}
         onChange={(e) => setForm({ ...form, address: e.target.value })}
         isRequired
         variant="bordered"
         labelPlacement="outside"
         startContent={<Icon icon="lucide:home" className="text-default-400" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Input
          label="City"
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          isRequired
          variant="bordered"
          labelPlacement="outside"
         />

         <Input
          label="Province"
          placeholder="Province"
          value={form.province}
          onChange={(e) => setForm({ ...form, province: e.target.value })}
          isRequired
          variant="bordered"
          labelPlacement="outside"
         />

         <Input
          label="Region"
          placeholder="Region"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
          isRequired
          variant="bordered"
          labelPlacement="outside"
         />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Input
          label="Latitude"
          placeholder="-26.2041"
          type="number"
          step="any"
          value={form.lat}
          onChange={(e) => setForm({ ...form, lat: e.target.value })}
          isRequired
          variant="bordered"
          labelPlacement="outside"
          startContent={<Icon icon="lucide:crosshair" className="text-default-400" />}
         />

         <Input
          label="Longitude"
          placeholder="28.0473"
          type="number"
          step="any"
          value={form.lng}
          onChange={(e) => setForm({ ...form, lng: e.target.value })}
          isRequired
          variant="bordered"
          labelPlacement="outside"
          startContent={<Icon icon="lucide:crosshair" className="text-default-400" />}
         />
        </div>
       </div>

       <Divider />

       {/* Operational Details */}
       <div className="space-y-4">
        <h3 className="text-sm font-semibold text-default-700 flex items-center gap-2">
         <Icon icon="lucide:settings" />
         Operational Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Input
          label="Phone (Optional)"
          placeholder="+27 11 123 4567"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          variant="bordered"
          labelPlacement="outside"
          startContent={<Icon icon="lucide:phone" className="text-default-400" />}
         />

         <Input
          label="Operating Hours"
          placeholder="e.g., 05:00 - 20:00"
          value={form.operatingHours}
          onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
          variant="bordered"
          labelPlacement="outside"
          startContent={<Icon icon="lucide:clock" className="text-default-400" />}
         />
        </div>

        <Input
         label="Capacity (Optional)"
         placeholder="Number of taxis"
         type="number"
         min="1"
         value={form.capacity}
         onChange={(e) => setForm({ ...form, capacity: e.target.value })}
         variant="bordered"
         labelPlacement="outside"
         startContent={<Icon icon="lucide:users" className="text-default-400" />}
        />

        <Input
         label="Image URL (Optional)"
         placeholder="https://example.com/image.jpg"
         type="url"
         value={form.image}
         onChange={(e) => setForm({ ...form, image: e.target.value })}
         variant="bordered"
         labelPlacement="outside"
         startContent={<Icon icon="lucide:image" className="text-default-400" />}
        />
       </div>

       {/* Actions */}
       <div className="flex gap-3 pt-4">
        <Button
         type="submit"
         color="primary"
         size="lg"
         isLoading={loading}
         startContent={!loading && <Icon icon="lucide:plus" />}
         className="flex-1"
        >
         {loading ? "Creating Rank..." : "Create Rank"}
        </Button>
        <Button
         as={Link}
         href="/dashboard/ranks"
         variant="bordered"
         size="lg"
         startContent={<Icon icon="lucide:x" />}
        >
         Cancel
        </Button>
       </div>
      </form>
     </CardBody>
    </Card>

    {/* Sidebar - Stats & Recent Ranks */}
    <div className="space-y-6">
     {/* Stats Card */}
     <Card>
      <CardHeader>
       <h3 className="text-lg font-semibold flex items-center gap-2">
        <Icon icon="lucide:bar-chart-3" />
        Rank Statistics
       </h3>
      </CardHeader>
      <CardBody className="space-y-4">
       {loadingData ? (
        <p className="text-sm text-default-500">Loading stats...</p>
       ) : (
        <>
         <div className="flex justify-between items-center">
          <span className="text-sm text-default-500">Total Ranks</span>
          <span className="text-2xl font-bold">{stats.total}</span>
         </div>
         <Divider />
         <div className="flex justify-between items-center">
          <span className="text-sm text-default-500">Active Ranks</span>
          <Chip color="success" variant="flat" size="sm">
           {stats.active}
          </Chip>
         </div>
         <Divider />
         <div className="flex justify-between items-center">
          <span className="text-sm text-default-500">Avg. Capacity</span>
          <span className="font-semibold">{stats.avgCapacity} taxis</span>
         </div>
        </>
       )}
      </CardBody>
     </Card>

     {/* Recent Ranks Example */}
     <Card>
      <CardHeader>
       <h3 className="text-lg font-semibold flex items-center gap-2">
        <Icon icon="lucide:clock" />
        Recent Ranks
       </h3>
      </CardHeader>
      <CardBody className="space-y-3">
       {loadingData && <p className="text-sm text-default-500">Loading ranks...</p>}
       {!loadingData && recentRanks.length === 0 && (
        <p className="text-sm text-default-500">No ranks created yet</p>
       )}
       {!loadingData &&
        recentRanks.length > 0 &&
        recentRanks.map((rank) => (
         <Card key={rank.id} className="bg-default-50/50" shadow="none">
          <CardBody className="py-2 px-3">
           <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
             <p className="text-sm font-medium">{rank.name}</p>
             {rank.isActive && (
              <Chip size="sm" color="success" variant="dot">
               Active
              </Chip>
             )}
            </div>
            <div className="flex items-center gap-2 text-xs text-default-500">
             <Icon icon="lucide:map-pin" className="w-3 h-3" />
             <span>
              {rank.city}, {rank.province}
             </span>
            </div>
            {rank.capacity && (
             <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Icon icon="lucide:users" className="w-3 h-3" />
              Capacity: {rank.capacity}
             </div>
            )}
           </div>
          </CardBody>
         </Card>
        ))}
      </CardBody>
     </Card>

     {/* Help Card */}
     <Card className="bg-primary-50/50 border border-primary-100">
      <CardBody className="py-4 px-4">
       <div className="flex gap-3">
        <Icon icon="lucide:lightbulb" className="text-primary w-5 h-5 flex-shrink-0" />
        <div className="space-y-1">
         <p className="text-sm font-medium text-primary">Location Tips</p>
         <p className="text-xs text-default-600">
          Use Google Maps to get accurate latitude and longitude coordinates. Right-click on
          the location and select coordinates to copy them.
         </p>
        </div>
       </div>
      </CardBody>
     </Card>
    </div>
   </div>
  </div>
 );
}
