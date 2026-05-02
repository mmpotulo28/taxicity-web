"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";

export default function EditForm({ route }: any) {
 const router = useRouter();
 const [form, setForm] = useState({ name: route.name, origin: route.origin, destination: route.destination, active: route.active });
 const [loading, setLoading] = useState(false);

 async function save(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  const res = await fetch(`/api/routes/${route.id}`, {
   method: "PUT",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(form),
  });
  setLoading(false);
  if (res.ok) router.refresh();
  else console.error("Update error", await res.json());
 }

 async function remove() {
  if (!confirm("Delete this route?")) return;
  const res = await fetch(`/api/routes/${route.id}`, { method: "DELETE" });
  if (res.ok) router.push("/dashboard/routes");
 }

 return (
  <form onSubmit={save} className="space-y-3">
   <h2 className="text-lg font-medium">Edit</h2>
   <Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} />
   <Input value={form.origin} onChange={(e: any) => setForm({ ...form, origin: e.target.value })} />
   <Input value={form.destination} onChange={(e: any) => setForm({ ...form, destination: e.target.value })} />
   <label className="flex items-center gap-2">
    <Checkbox isSelected={form.active} onValueChange={(val: boolean) => setForm({ ...form, active: val })} />
    Active
   </label>
   <div className="flex gap-2">
    <Button type="submit" disabled={loading} color="primary">{loading ? "Saving..." : "Save"}</Button>
    <Button type="button" onClick={remove} color="danger">Delete</Button>
   </div>
  </form>
 );
}
