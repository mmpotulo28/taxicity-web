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
 Pagination,
} from "@heroui/react";
import { Eye, Edit, Trash2, Search, Filter } from "lucide-react";
import React from "react";

const columns = [
 { name: "DRIVER", uid: "name" },
 { name: "ROLE", uid: "role" },
 { name: "STATUS", uid: "status" },
 { name: "VEHICLE", uid: "vehicle" },
 { name: "RATING", uid: "rating" },
 { name: "ACTIONS", uid: "actions" },
];

const users = [
 {
  id: 1,
  name: "Tony Reichert",
  role: "Senior Driver",
  team: "Central",
  status: "active",
  age: "29",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  email: "tony.reichert@example.com",
  vehicle: "Toyota HiAce (XYZ-123)",
  rating: "4.8",
 },
 {
  id: 2,
  name: "Zoey Lang",
  role: "Driver",
  team: "North",
  status: "paused",
  age: "25",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  email: "zoey.lang@example.com",
  vehicle: "Nissan Impendulo (ABC-987)",
  rating: "4.9",
 },
 {
  id: 3,
  name: "Jane Fisher",
  role: "Driver",
  team: "South",
  status: "vacation",
  age: "22",
  avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  email: "jane.fisher@example.com",
  vehicle: "Mercedes Sprinter (JKA-111)",
  rating: "4.5",
 },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
 active: "success",
 paused: "danger",
 vacation: "warning",
};

export default function DriversPage() {
 const [filterValue, setFilterValue] = React.useState("");

 const renderCell = React.useCallback((user: typeof users[0], columnKey: React.Key) => {
  const cellValue = user[columnKey as keyof typeof user];

  switch (columnKey) {
   case "name":
    return (
     <User
      avatarProps={{ radius: "lg", src: user.avatar, isBordered: true }}
      description={user.email}
      name={cellValue}
     >
      {user.email}
     </User>
    );
   case "role":
    return (
     <div className="flex flex-col">
      <p className="font-bold text-sm capitalize text-default-700">{cellValue}</p>
      <p className="text-tiny text-default-500 capitalize">{user.team}</p>
     </div>
    );
   case "status":
    return (
     <Chip
      className="capitalize border-none gap-1 text-default-600"
      color={statusColorMap[user.status]}
      size="sm"
      variant="dot"
     >
      {cellValue}
     </Chip>
    );
   case "vehicle":
    return (
     <div className="flex flex-col">
      <p className="text-bold text-sm capitalize">{cellValue}</p>
     </div>
    );
   case "rating":
    return (
     <div className="flex items-center gap-1">
      <span className="text-sm font-bold">{cellValue}</span>
      <span className="text-warning-500">★</span>
     </div>
    );
   case "actions":
    return (
     <div className="relative flex items-center gap-2">
      <Tooltip content="Details">
       <span className="cursor-pointer text-lg text-default-400 active:opacity-50 hover:text-default-500">
        <Eye size={18} />
       </span>
      </Tooltip>
      <Tooltip content="Edit user">
       <span className="cursor-pointer text-lg text-default-400 active:opacity-50 hover:text-default-500">
        <Edit size={18} />
       </span>
      </Tooltip>
      <Tooltip color="danger" content="Delete user">
       <span className="cursor-pointer text-lg text-danger active:opacity-50 hover:text-danger-400">
        <Trash2 size={18} />
       </span>
      </Tooltip>
     </div>
    );
   default:
    return cellValue;
  }
 }, []);

 return (
  <div className="space-y-6">
   <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
     <h1 className="text-2xl font-bold tracking-tight">Drivers Management</h1>
     <p className="text-default-500 text-sm">Manage your fleet drivers and their profiles.</p>
    </div>
    <Button color="primary" className="shadow-md" endContent={<span className="text-xl">+</span>}>
     Add Driver
    </Button>
   </div>

   <div className="flex justify-between gap-3 items-end">
    <Input
     isClearable
     classNames={{
      base: "w-full sm:max-w-[44%]",
      inputWrapper: "border-1",
     }}
     placeholder="Search by name..."
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
    aria-label="Drivers table"
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
    <TableBody items={users}>
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
