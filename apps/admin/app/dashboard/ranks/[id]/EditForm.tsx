"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Icon } from "@iconify/react";
import { Divider } from "@heroui/divider";

interface Rank {
 id: string;
 name: string;
 address: string;
 city: string;
 province: string;
 region: string;
 description: string | null;
 lat: number;
 lng: number;
 phone: string | null;
 operatingHours: string | null;
 capacity: number | null;
 image: string | null;
 isActive: boolean;
}

interface EditFormProps {
 rank: Rank;
}

export default function EditForm({ rank }: EditFormProps) {
 const router = useRouter();
 const [form, setForm] = useState({
  name: rank.name,
  address: rank.address,
  city: rank.city,
  province: rank.province,
  region: rank.region,
  description: rank.description || "",
  lat: rank.lat.toString(),
  lng: rank.lng.toString(),
  phone: rank.phone || "",
  operatingHours: rank.operatingHours || "",
  capacity: rank.capacity?.toString() || "",
  image: rank.image || "",
  isActive: rank.isActive,
 });
 const [loading, setLoading] = useState(false);

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  try {
   const res = await fetch(`/api/ranks/${rank.id}`, {
    method: "PATCH",
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
     isActive: form.isActive,
    }),
   });

   if (res.ok) {
    router.refresh();
    alert("Rank updated successfully!");
   } else {
    const error = await res.json();
    alert(`Failed to update rank: ${error.error || "Unknown error"}`);
   }
  } catch (error) {
   console.error("Error updating rank:", error);
   alert("An error occurred while updating the rank");
  } finally {
   setLoading(false);
  }
 }

 return (
  <Card>
   <CardHeader>
    <h2 className="text-xl font-semibold flex items-center gap-2">
     <Icon icon="lucide:edit" />
     Edit Rank
    </h2>
   </CardHeader>
   <CardBody>
    <form onSubmit={handleSubmit} className="space-y-4">
     <Input
      label="Name"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      variant="bordered"
      labelPlacement="outside"
      size="sm"
     />

     <Input
      label="Address"
      value={form.address}
      onChange={(e) => setForm({ ...form, address: e.target.value })}
      variant="bordered"
      labelPlacement="outside"
      size="sm"
     />

     <div className="grid grid-cols-2 gap-2">
      <Input
       label="City"
       value={form.city}
       onChange={(e) => setForm({ ...form, city: e.target.value })}
       variant="bordered"
       labelPlacement="outside"
       size="sm"
      />

      <Input
       label="Province"
       value={form.province}
       onChange={(e) => setForm({ ...form, province: e.target.value })}
       variant="bordered"
       labelPlacement="outside"
       size="sm"
      />
     </div>

     <Input
      label="Region"
      value={form.region}
      onChange={(e) => setForm({ ...form, region: e.target.value })}
      variant="bordered"
      labelPlacement="outside"
      size="sm"
     />

     <Textarea
      label="Description"
      value={form.description}
      onChange={(e) => setForm({ ...form, description: e.target.value })}
      variant="bordered"
      labelPlacement="outside"
      size="sm"
      minRows={2}
     />

     <div className="grid grid-cols-2 gap-2">
      <Input
       label="Latitude"
       type="number"
       step="any"
       value={form.lat}
       onChange={(e) => setForm({ ...form, lat: e.target.value })}
       variant="bordered"
       labelPlacement="outside"
       size="sm"
      />

      <Input
       label="Longitude"
       type="number"
       step="any"
       value={form.lng}
       onChange={(e) => setForm({ ...form, lng: e.target.value })}
       variant="bordered"
       labelPlacement="outside"
       size="sm"
      />
     </div>

     <Input
      label="Phone"
      type="tel"
      value={form.phone}
      onChange={(e) => setForm({ ...form, phone: e.target.value })}
      variant="bordered"
      labelPlacement="outside"
      size="sm"
     />

     <Input
      label="Operating Hours"
      value={form.operatingHours}
      onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
      variant="bordered"
      labelPlacement="outside"
      size="sm"
     />

     <Input
      label="Capacity"
      type="number"
      value={form.capacity}
      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
      variant="bordered"
      labelPlacement="outside"
      size="sm"
     />

     <Input
      label="Image URL"
      type="url"
      value={form.image}
      onChange={(e) => setForm({ ...form, image: e.target.value })}
      variant="bordered"
      labelPlacement="outside"
      size="sm"
     />

     <Divider />

     <Switch
      isSelected={form.isActive}
      onValueChange={(value) => setForm({ ...form, isActive: value })}
     >
      <span className="text-sm">Active Status</span>
     </Switch>

     <Button
      type="submit"
      color="primary"
      className="w-full"
      isLoading={loading}
      startContent={!loading && <Icon icon="lucide:save" />}
     >
      {loading ? "Saving..." : "Save Changes"}
     </Button>
    </form>
   </CardBody>
  </Card>
 );
}
