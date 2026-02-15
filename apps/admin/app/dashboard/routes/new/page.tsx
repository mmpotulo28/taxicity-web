"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";
import { Chip } from "@heroui/chip";
import Link from "next/link";

interface Rank {
 id: string;
 name: string;
 address: string;
 city: string;
 lat: number;
 lng: number;
}

interface Route {
 id: string;
 name: string;
 sourceRank: Rank;
 destRank: Rank;
 baseFare: number;
 distance: number;
 estimatedDuration: number;
 status: string;
}

export default function NewRoutePage() {
 const router = useRouter();
 const [form, setForm] = useState({
  name: "",
  description: "",
  sourceRankId: "",
  destRankId: "",
  baseFare: "",
 });
 const [loading, setLoading] = useState(false);
 const [ranks, setRanks] = useState<Rank[]>([]);
 const [recentRoutes, setRecentRoutes] = useState<Route[]>([]);
 const [stats, setStats] = useState({ total: 0, active: 0, avgDistance: 0 });
 const [loadingData, setLoadingData] = useState(true);

 useEffect(() => {
  // Fetch ranks for selection
  const fetchData = async () => {
   try {
    const [ranksRes, routesRes] = await Promise.all([
     fetch("/api/ranks"),
     fetch("/api/routes"),
    ]);

    if (ranksRes.ok) {
     const ranksData = await ranksRes.json();
     setRanks(ranksData);
    }

    if (routesRes.ok) {
     const routesData: Route[] = await routesRes.json();
     setRecentRoutes(routesData.slice(0, 3));

     // Calculate stats
     const total = routesData.length;
     const active = routesData.filter((r) => r.status === "ACTIVE").length;
     const avgDist =
      routesData.reduce((acc, r) => acc + (r.distance || 0), 0) / total || 0;

     setStats({
      total,
      active,
      avgDistance: Number(avgDist.toFixed(1)),
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
  if (!form.name || !form.sourceRankId || !form.destRankId || !form.baseFare) {
   alert("Please fill in all required fields");
   return;
  }

  setLoading(true);
  try {
   const res = await fetch("/api/routes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     name: form.name,
     description: form.description,
     sourceRankId: form.sourceRankId,
     destRankId: form.destRankId,
     baseFare: Number(form.baseFare),
    }),
   });

   if (res.ok) {
    router.push("/dashboard/routes");
   } else {
    const error = await res.json();
    console.error("Create failed", error);
    alert(`Failed to create route: ${error.error || "Unknown error"}`);
   }
  } finally {
   setLoading(false);
  }
 }

 const sourceRank = ranks.find((r) => r.id === form.sourceRankId);
 const destRank = ranks.find((r) => r.id === form.destRankId);

 return (
  <div className="space-y-6 max-w-7xl mx-auto p-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-3xl font-bold">Create New Route</h1>
     <p className="text-default-500 mt-1">Add a new route between two taxi ranks</p>
    </div>
    <Link href="/dashboard/routes">
     <Button variant="light" startContent={<Icon icon="lucide:arrow-left" />}>
      Back
     </Button>
    </Link>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Main Form */}
    <Card className="lg:col-span-2">
     <CardHeader className="flex flex-col items-start px-6 pb-0 pt-6">
      <h2 className="text-xl font-semibold">Route Details</h2>
      <p className="text-sm text-default-500">Enter the information for the new route</p>
     </CardHeader>
     <CardBody className="px-6 py-6">
      <form onSubmit={submit} className="space-y-6">
       {/* Route Name */}
       <Input
        label="Route Name"
        placeholder="e.g., Sandton to Soweto Express"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        isRequired
        variant="bordered"
        labelPlacement="outside"
        startContent={<Icon icon="lucide:route" className="text-default-400" />}
       />

       {/* Description */}
       <Input
        label="Description (Optional)"
        placeholder="Brief description of this route"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        variant="bordered"
        labelPlacement="outside"
        startContent={<Icon icon="lucide:file-text" className="text-default-400" />}
       />

       <Divider />

       {/* Rank Selection */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Autocomplete
         label="Origin Rank"
         placeholder="Select starting point"
         isRequired
         variant="bordered"
         labelPlacement="outside"
         selectedKey={form.sourceRankId}
         onSelectionChange={(key) =>
          setForm({ ...form, sourceRankId: key as string })
         }
         startContent={<Icon icon="lucide:map-pin" className="text-success" />}
        >
         {ranks.map((rank) => (
          <AutocompleteItem key={rank.id} textValue={rank.name}>
           <div className="flex flex-col">
            <span className="font-medium">{rank.name}</span>
            <span className="text-xs text-default-400">
             {rank.city}, {rank.address}
            </span>
           </div>
          </AutocompleteItem>
         ))}
        </Autocomplete>

        <Autocomplete
         label="Destination Rank"
         placeholder="Select end point"
         isRequired
         variant="bordered"
         labelPlacement="outside"
         selectedKey={form.destRankId}
         onSelectionChange={(key) =>
          setForm({ ...form, destRankId: key as string })
         }
         startContent={<Icon icon="lucide:flag" className="text-danger" />}
        >
         {ranks.map((rank) => (
          <AutocompleteItem key={rank.id} textValue={rank.name}>
           <div className="flex flex-col">
            <span className="font-medium">{rank.name}</span>
            <span className="text-xs text-default-400">
             {rank.city}, {rank.address}
            </span>
           </div>
          </AutocompleteItem>
         ))}
        </Autocomplete>
       </div>

       {/* Selected Route Preview */}
       {sourceRank && destRank && (
        <Card className="bg-default-100">
         <CardBody className="py-3">
          <div className="flex items-center gap-3">
           <Icon icon="lucide:arrow-right-circle" className="text-2xl text-primary" />
           <div className="flex-1">
            <p className="text-sm font-medium">
             {sourceRank.name} → {destRank.name}
            </p>
            <p className="text-xs text-default-500">
             {sourceRank.city} to {destRank.city}
            </p>
           </div>
          </div>
         </CardBody>
        </Card>
       )}

       <Divider />

       {/* Pricing */}
       <Input
        label="Base Fare (ZAR)"
        placeholder="0.00"
        type="number"
        step="0.01"
        min="0"
        value={form.baseFare}
        onChange={(e) => setForm({ ...form, baseFare: e.target.value })}
        isRequired
        variant="bordered"
        labelPlacement="outside"
        startContent={<span className="text-default-400">R</span>}
       />

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
         {loading ? "Creating Route..." : "Create Route"}
        </Button>
        <Button
         as={Link}
         href="/dashboard/routes"
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

    {/* Sidebar - Stats & Recent Routes */}
    <div className="space-y-6">
     {/* Stats Card */}
     <Card>
      <CardHeader>
       <h3 className="text-lg font-semibold flex items-center gap-2">
        <Icon icon="lucide:bar-chart-3" />
        Route Statistics
       </h3>
      </CardHeader>
      <CardBody className="space-y-4">
       {loadingData ? (
        <p className="text-sm text-default-500">Loading stats...</p>
       ) : (
        <>
         <div className="flex justify-between items-center">
          <span className="text-sm text-default-500">Total Routes</span>
          <span className="text-2xl font-bold">{stats.total}</span>
         </div>
         <Divider />
         <div className="flex justify-between items-center">
          <span className="text-sm text-default-500">Active Routes</span>
          <Chip color="success" variant="flat" size="sm">
           {stats.active}
          </Chip>
         </div>
         <Divider />
         <div className="flex justify-between items-center">
          <span className="text-sm text-default-500">Avg. Distance</span>
          <span className="font-semibold">{stats.avgDistance} km</span>
         </div>
        </>
       )}
      </CardBody>
     </Card>

     {/* Recent Routes Example */}
     <Card>
      <CardHeader>
       <h3 className="text-lg font-semibold flex items-center gap-2">
        <Icon icon="lucide:clock" />
        Recent Routes
       </h3>
      </CardHeader>
      <CardBody className="space-y-3">
       {loadingData && <p className="text-sm text-default-500">Loading routes...</p>}
       {!loadingData && recentRoutes.length === 0 && (
        <p className="text-sm text-default-500">No routes created yet</p>
       )}
       {!loadingData &&
        recentRoutes.length > 0 &&
        recentRoutes.map((route) => (
         <Card key={route.id} className="bg-default-50/50" shadow="none">
          <CardBody className="py-2 px-3">
           <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{route.name}</p>
            <div className="flex items-center gap-2 text-xs text-default-500">
             <Icon icon="lucide:navigation" className="w-3 h-3" />
             <span>{route.distance} km</span>
             <span>•</span>
             <span>~{route.estimatedDuration} min</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-success">
             <Icon icon="lucide:banknote" className="w-3 h-3" />
             R{Number(route.baseFare).toFixed(2)}
            </div>
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
         <p className="text-sm font-medium text-primary">Pro Tip</p>
         <p className="text-xs text-default-600">
          Distance and duration will be automatically calculated using Google Maps API based
          on the selected ranks.
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
