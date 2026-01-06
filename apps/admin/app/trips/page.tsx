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
import { Eye, MapPin, Search, Filter, Calendar } from "lucide-react";
import React from "react";

const columns = [
 { name: "TRIP ID", uid: "id" },
 { name: "DRIVER", uid: "driver" },
 { name: "ROUTE", uid: "route" },
 { name: "STATUS", uid: "status" },
 { name: "DATE", uid: "date" },
 { name: "FARE", uid: "fare" },
 { name: "ACTIONS", uid: "actions" },
];

const trips = [
 {
  id: "TR-8821",
  driver: { name: "John Doe", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
  route: "Downtown - Airport",
  status: "completed",
  date: "May 12, 10:30 AM",
  fare: "R 45.00"
 },
 {
  id: "TR-8822",
  driver: { name: "Sarah Williams", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
  route: "Mall - Suburbs",
  status: "in-progress",
  date: "May 12, 10:45 AM",
  fare: "R 30.00"
 },
 {
  id: "TR-8823",
  driver: { name: "Mike Tyson", avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d" },
  route: "University - Central",
  status: "cancelled",
  date: "May 12, 11:00 AM",
  fare: "R 0.00"
 },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
 completed: "success",
 "in-progress": "primary",
 cancelled: "danger",
};

export default function TripsPage() {
 const [filterValue, setFilterValue] = React.useState("");

 const renderCell = React.useCallback((trip: typeof trips[0], columnKey: React.Key) => {
  switch (columnKey) {
   case "driver":
    return (
     <User
      avatarProps={{ radius: "lg", src: trip.driver.avatar, isBordered: true }}
      name={trip.driver.name}
      description="Driver"
     >
      {trip.driver.name}
     </User>
    );
   case "route":
    return (
     <div className="flex items-center gap-1 text-default-600">
      <MapPin size={14} className="text-secondary" />
      <span>{trip.route}</span>
     </div>
    );
   case "status":
    return (
     <Chip
      className="capitalize border-none gap-1 text-default-600"
      color={statusColorMap[trip.status]}
      size="sm"
      variant="dot"
     >
      {trip.status}
     </Chip>
    );
   case "fare":
    return (
     <span className="font-semibold text-default-900">{trip.fare}</span>
    );
   case "actions":
    return (
     <div className="relative flex items-center gap-2">
      <Tooltip content="View Details">
       <span className="cursor-pointer text-lg text-default-400 active:opacity-50 hover:text-default-500">
        <Eye size={18} />
       </span>
      </Tooltip>
     </div>
    );
   default:
    const val = trip[columnKey as keyof typeof trip];
    return (typeof val === "string" || typeof val === "number") ? val : null;
  }
 }, []);

 return (
  <div className="space-y-6">
   <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
     <h1 className="text-2xl font-bold tracking-tight">Trip History</h1>
     <p className="text-default-500 text-sm">Monitor ongoing and completed trips across the fleet.</p>
    </div>
   </div>

   <div className="flex justify-between gap-3 items-end">
    <Input
     isClearable
     classNames={{
      base: "w-full sm:max-w-[44%]",
      inputWrapper: "border-1",
     }}
     placeholder="Search trip ID or driver..."
     size="sm"
     startContent={<Search className="text-default-300" />}
     value={filterValue}
     variant="bordered"
     onClear={() => setFilterValue("")}
     onValueChange={setFilterValue}
    />
    <div className="flex gap-3">
     <Button size="sm" variant="flat" startContent={<Calendar size={16} />}>
      Date Range
     </Button>
     <Button size="sm" variant="flat" endContent={<Filter size={16} />}>
      Filters
     </Button>
    </div>
   </div>

   <Table
    aria-label="Trips table"
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
    <TableBody items={trips}>
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
