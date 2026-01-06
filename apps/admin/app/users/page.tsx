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
import { Ban, History, Search, Filter } from "lucide-react";
import React from "react";

const columns = [
 { name: "PASSENGER", uid: "name" },
 { name: "STATUS", uid: "status" },
 { name: "TRIPS", uid: "trips" },
 { name: "RATING", uid: "rating" },
 { name: "JOINED", uid: "joined" },
 { name: "ACTIONS", uid: "actions" },
];

const users = [
 {
  id: 1,
  name: "Alice Johnson",
  status: "active",
  trips: 45,
  rating: "4.9",
  avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
  email: "alice.j@example.com",
  joined: "Jan 12, 2024",
 },
 {
  id: 2,
  name: "Bob Smith",
  status: "active",
  trips: 12,
  rating: "4.7",
  avatar: "https://i.pravatar.cc/150?u=a04258114e29026708c",
  email: "bob.smith@example.com",
  joined: "Feb 01, 2024",
 },
 {
  id: 3,
  name: "Charlie Brown",
  status: "suspended",
  trips: 8,
  rating: "3.2",
  avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  email: "charlie.b@example.com",
  joined: "Mar 15, 2024",
 },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
 active: "success",
 suspended: "danger",
 inactive: "default",
};

export default function PassengersPage() {
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
   case "rating":
    return (
     <div className="flex items-center gap-1">
      <span className="text-sm font-bold">{cellValue}</span>
      <span className="text-warning-500">★</span>
     </div>
    );
   case "trips":
    return (
     <div className="font-semibold text-default-600">{cellValue}</div>
    );
   case "actions":
    return (
     <div className="relative flex items-center gap-2">
      <Tooltip content="View History">
       <span className="cursor-pointer text-lg text-default-400 active:opacity-50 hover:text-default-500">
        <History size={18} />
       </span>
      </Tooltip>
      <Tooltip color="danger" content="Suspend User">
       <span className="cursor-pointer text-lg text-danger active:opacity-50 hover:text-danger-400">
        <Ban size={18} />
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
     <h1 className="text-2xl font-bold tracking-tight">Passengers Management</h1>
     <p className="text-default-500 text-sm">View and manage registered passenger accounts.</p>
    </div>
   </div>

   <div className="flex justify-between gap-3 items-end">
    <Input
     isClearable
     classNames={{
      base: "w-full sm:max-w-[44%]",
      inputWrapper: "border-1",
     }}
     placeholder="Search passengers..."
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
    aria-label="Passengers table"
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
