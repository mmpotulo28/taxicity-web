"use client";

import {
 Table,
 TableHeader,
 TableColumn,
 TableBody,
 TableRow,
 TableCell,
 Chip,
 Tooltip,
 ChipProps,
 Button,
 Input,
 Pagination
} from "@heroui/react";
import { Search, Filter, Plus, PenSquare, Trash2, MapPin, Navigation } from "lucide-react";
import React from "react";

const columns = [
 { name: "ROUTE NAME", uid: "name" },
 { name: "ORIGIN", uid: "origin" },
 { name: "DESTINATION", uid: "destination" },
 { name: "FARE", uid: "fare" },
 { name: "STATUS", uid: "status" },
 { name: "ACTIONS", uid: "actions" },
];

const routes = [
 {
  id: 1,
  name: "CBD to Sandton",
  origin: "Johannesburg CBD Rank",
  destination: "Sandton City Rank",
  fare: "R 25.00",
  status: "active"
 },
 {
  id: 2,
  name: "Soweto to JHB",
  origin: "Bara Taxi Rank",
  destination: "Noord Street Rank",
  fare: "R 18.00",
  status: "active"
 },
 {
  id: 3,
  name: "Airport Express",
  origin: "Sandton Gautrain",
  destination: "OR Tambo Airport",
  fare: "R 150.00",
  status: "inactive"
 },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
 active: "success",
 inactive: "default",
 suspended: "danger",
};

export default function RoutesPage() {
 const [filterValue, setFilterValue] = React.useState("");

 const renderCell = React.useCallback((route: typeof routes[0], columnKey: React.Key) => {
  switch (columnKey) {
   case "name":
    return (
     <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
       <Navigation size={18} />
      </div>
      <span className="font-semibold text-default-900">{route.name}</span>
     </div>
    );
   case "origin":
   case "destination":
    return (
     <div className="flex items-center gap-1 text-default-600">
      <MapPin size={14} className="text-default-400" />
      <span>{route[columnKey as keyof typeof route]}</span>
     </div>
    );
   case "fare":
    return (
     <span className="font-mono font-semibold">{route.fare}</span>
    );
   case "status":
    return (
     <Chip
      className="capitalize border-none gap-1 text-default-600"
      color={statusColorMap[route.status]}
      size="sm"
      variant="dot"
     >
      {route.status}
     </Chip>
    );
   case "actions":
    return (
     <div className="relative flex items-center gap-2">
      <Tooltip content="Edit Route">
       <span className="cursor-pointer text-lg text-default-400 active:opacity-50 hover:text-default-500">
        <PenSquare size={18} />
       </span>
      </Tooltip>
      <Tooltip color="danger" content="Delete Route">
       <span className="cursor-pointer text-lg text-danger active:opacity-50 hover:text-danger-400">
        <Trash2 size={18} />
       </span>
      </Tooltip>
     </div>
    );
   default:
    const val = route[columnKey as keyof typeof route];
    return (typeof val === "string" || typeof val === "number") ? val : null;
  }
 }, []);

 return (
  <div className="space-y-6">
   <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
     <h1 className="text-2xl font-bold tracking-tight">Routes & Ranks</h1>
     <p className="text-default-500 text-sm">Manage operational routes, fares, and taxi ranks.</p>
    </div>
    <Button color="primary" endContent={<Plus size={16} />} className="shadow-md shadow-primary/20">
     New Route
    </Button>
   </div>

   <div className="flex justify-between gap-3 items-end">
    <Input
     isClearable
     classNames={{
      base: "w-full sm:max-w-[44%]",
      inputWrapper: "border-1",
     }}
     placeholder="Search routes..."
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
    aria-label="Routes table"
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
    <TableBody items={routes}>
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
