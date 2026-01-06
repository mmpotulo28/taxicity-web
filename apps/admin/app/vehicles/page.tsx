"use client";

import {
 Table,
 TableHeader,
 TableColumn,
 TableBody,
 TableRow,
 TableCell,
 User,
 Chip,
 Tooltip,
 ChipProps,
 Button,
 Input,
 Pagination
} from "@heroui/react";
import { Search, Filter, Plus, PenSquare, Trash2, Car } from "lucide-react";
import React from "react";

const columns = [
 { name: "VEHICLE", uid: "name" },
 { name: "PLATE", uid: "plate" },
 { name: "TYPE", uid: "type" },
 { name: "STATUS", uid: "status" },
 { name: "DRIVER", uid: "driver" },
 { name: "ACTIONS", uid: "actions" },
];

const vehicles = [
 {
  id: 1,
  name: "Toyota HiAce",
  plate: "XYZ-123-GP",
  type: "Minibus (16)",
  status: "active",
  driver: { name: "Tony Reichert", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" }
 },
 {
  id: 2,
  name: "Mercedes Sprinter",
  plate: "ABC-987-GP",
  type: "Minibus (22)",
  status: "maintenance",
  driver: { name: "Zoey Lang", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }
 },
 {
  id: 3,
  name: "Toyota Quantum",
  plate: "GP-456-L",
  type: "Minibus (14)",
  status: "active",
  driver: { name: "Jane Doe", avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d" }
 },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
 active: "success",
 maintenance: "warning",
 inactive: "danger",
};

export default function VehiclesPage() {
 const [filterValue, setFilterValue] = React.useState("");

 const renderCell = React.useCallback((vehicle: typeof vehicles[0], columnKey: React.Key) => {
  switch (columnKey) {
   case "name":
    return (
     <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-default-100 text-default-500">
       <Car size={18} />
      </div>
      <span className="font-semibold text-default-900">{vehicle.name}</span>
     </div>
    );
   case "plate":
    return (
     <Chip size="sm" variant="bordered" className="font-mono">{vehicle.plate}</Chip>
    );
   case "driver":
    return (
     <User
      avatarProps={{ radius: "lg", src: vehicle.driver.avatar, size: "sm" }}
      name={vehicle.driver.name}
     />
    );
   case "status":
    return (
     <Chip
      className="capitalize border-none gap-1 text-default-600"
      color={statusColorMap[vehicle.status]}
      size="sm"
      variant="dot"
     >
      {vehicle.status}
     </Chip>
    );
   case "actions":
    return (
     <div className="relative flex items-center gap-2">
      <Tooltip content="Edit Vehicle">
       <span className="cursor-pointer text-lg text-default-400 active:opacity-50 hover:text-default-500">
        <PenSquare size={18} />
       </span>
      </Tooltip>
      <Tooltip color="danger" content="Remove Vehicle">
       <span className="cursor-pointer text-lg text-danger active:opacity-50 hover:text-danger-400">
        <Trash2 size={18} />
       </span>
      </Tooltip>
     </div>
    );
   default:
    const val = vehicle[columnKey as keyof typeof vehicle];
    return (typeof val === "string" || typeof val === "number") ? val : null;
  }
 }, []);

 return (
  <div className="space-y-6">
   <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
     <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
     <p className="text-default-500 text-sm">Manage registered vehicles and assignments.</p>
    </div>
    <Button color="primary" endContent={<Plus size={16} />} className="shadow-md shadow-primary/20">
     Add Vehicle
    </Button>
   </div>

   <div className="flex justify-between gap-3 items-end">
    <Input
     isClearable
     classNames={{
      base: "w-full sm:max-w-[44%]",
      inputWrapper: "border-1",
     }}
     placeholder="Search by plate or model..."
     size="sm"
     startContent={<Search className="text-default-300" />}
     value={filterValue}
     variant="bordered"
     onClear={() => setFilterValue("")}
     onValueChange={setFilterValue}
    />
    <div className="flex gap-3">
     <Button size="sm" variant="flat" endContent={<Filter size={16} />}>
      Filters
     </Button>
    </div>
   </div>

   <Table
    aria-label="Vehicles table"
    classNames={{
     wrapper: "min-h-[400px] shadow-sm border-none bg-content1",
    }}
    bottomContent={
     <div className="flex w-full justify-center">
      <Pagination
       isCompact
       showControls
       showShadow
       color="primary"
       page={1}
       total={10}
      />
     </div>
    }
   >
    <TableHeader columns={columns}>
     {(column) => (
      <TableColumn
       key={column.uid}
       align={column.uid === "actions" ? "center" : "start"}
       className="text-xs uppercase font-semibold text-default-500 bg-transparent"
      >
       {column.name}
      </TableColumn>
     )}
    </TableHeader>
    <TableBody items={vehicles}>
     {(item) => (
      <TableRow key={item.id} className="cursor-pointer hover:bg-default-50 transition-colors">
       {(columnKey) => (
        <TableCell>{renderCell(item, columnKey)}</TableCell>
       )}
      </TableRow>
     )}
    </TableBody>
   </Table>
  </div>
 );
}
