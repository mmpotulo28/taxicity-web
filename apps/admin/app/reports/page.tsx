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
 Pagination,
 Card,
 CardBody
} from "@heroui/react";
import { Download, FileText, Search, Plus, TrendingUp, DollarSign, Users } from "lucide-react";
import React from "react";

const columns = [
 { name: "REPORT NAME", uid: "name" },
 { name: "TYPE", uid: "type" },
 { name: "GENERATED ON", uid: "date" },
 { name: "STATUS", uid: "status" },
 { name: "SIZE", uid: "size" },
 { name: "ACTIONS", uid: "actions" },
];

const reports = [
 {
  id: 1,
  name: "Monthly Revenue - April 2024",
  type: "Financial",
  date: "May 01, 2024",
  status: "ready",
  size: "2.4 MB"
 },
 {
  id: 2,
  name: "Driver Performance Q1",
  type: "Performance",
  date: "Apr 15, 2024",
  status: "ready",
  size: "1.1 MB"
 },
 {
  id: 3,
  name: "Passenger Growth Stats",
  type: "Analytics",
  date: "May 10, 2024",
  status: "processing",
  size: "-"
 },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
 ready: "success",
 processing: "warning",
 failed: "danger",
};

export default function ReportsPage() {
 const [filterValue, setFilterValue] = React.useState("");

 const renderCell = React.useCallback((report: typeof reports[0], columnKey: React.Key) => {
  const cellValue = report[columnKey as keyof typeof report];

  switch (columnKey) {
   case "name":
    return (
     <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
       <FileText size={18} />
      </div>
      <div className="flex flex-col">
       <span className="text-small font-semibold text-default-900">{cellValue}</span>
       <span className="text-tiny text-default-500">PDF Format</span>
      </div>
     </div>
    );
   case "status":
    return (
     <Chip
      className="capitalize border-none gap-1 text-default-600"
      color={statusColorMap[report.status]}
      size="sm"
      variant="dot"
     >
      {cellValue}
     </Chip>
    );
   case "actions":
    return (
     <div className="relative flex items-center gap-2">
      <Tooltip content="Download">
       <span className={`text-lg transition-opacity ${report.status === 'ready' ? 'cursor-pointer text-primary active:opacity-50 hover:text-primary-400' : 'opacity-30 cursor-not-allowed text-default-400'}`}>
        <Download size={18} />
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
     <h1 className="text-2xl font-bold tracking-tight">Financial & Activity Reports</h1>
     <p className="text-default-500 text-sm">Download and manage system reports.</p>
    </div>
    <Button color="primary" endContent={<Plus size={16} />} className="shadow-md shadow-primary/20">
     Generate Report
    </Button>
   </div>

   {/* Quick Stats for Reports */}
   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="shadow-sm border border-default-100 bg-content1">
     <CardBody className="flex flex-row items-center gap-4 p-4">
      <div className="p-3 rounded-xl bg-success/10 text-success">
       <DollarSign size={24} />
      </div>
      <div>
       <p className="text-tiny uppercase text-default-500 font-bold">Total Revenue</p>
       <h4 className="text-xl font-bold">R 450,290</h4>
      </div>
     </CardBody>
    </Card>
    <Card className="shadow-sm border border-default-100 bg-content1">
     <CardBody className="flex flex-row items-center gap-4 p-4">
      <div className="p-3 rounded-xl bg-primary/10 text-primary">
       <TrendingUp size={24} />
      </div>
      <div>
       <p className="text-tiny uppercase text-default-500 font-bold">Growth (MoM)</p>
       <h4 className="text-xl font-bold">+12.5%</h4>
      </div>
     </CardBody>
    </Card>
    <Card className="shadow-sm border border-default-100 bg-content1">
     <CardBody className="flex flex-row items-center gap-4 p-4">
      <div className="p-3 rounded-xl bg-warning/10 text-warning">
       <Users size={24} />
      </div>
      <div>
       <p className="text-tiny uppercase text-default-500 font-bold">New Accounts</p>
       <h4 className="text-xl font-bold">1,203</h4>
      </div>
     </CardBody>
    </Card>
   </div>

   <div className="flex justify-between gap-3 items-end">
    <Input
     isClearable
     classNames={{
      base: "w-full sm:max-w-[44%]",
      inputWrapper: "border-1",
     }}
     placeholder="Search reports..."
     size="sm"
     startContent={<Search className="text-default-300" />}
     value={filterValue}
     variant="bordered"
     onClear={() => setFilterValue("")}
     onValueChange={setFilterValue}
    />
   </div>

   <Table
    aria-label="Reports table"
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
    <TableBody items={reports}>
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
