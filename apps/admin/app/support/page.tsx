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
import { Search, Filter, MessageSquare, CheckCircle } from "lucide-react";
import React from "react";

const columns = [
  { name: "TICKET ID", uid: "id" },
  { name: "USER", uid: "user" },
  { name: "SUBJECT", uid: "subject" },
  { name: "PRIORITY", uid: "priority" },
  { name: "STATUS", uid: "status" },
  { name: "CREATED", uid: "created" },
  { name: "ACTIONS", uid: "actions" },
];

const tickets = [
  {
    id: "#8823",
    user: { name: "Alice Johnson", email: "alice@example.com", avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d" },
    subject: "Refund Request - Trip #9921",
    priority: "high",
    status: "open",
    created: "2 hours ago"
  },
  {
    id: "#8824",
    user: { name: "Tony Reichert", email: "driver@example.com", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    subject: "App Crash Issue",
    priority: "medium",
    status: "in-progress",
    created: "5 hours ago"
  },
  {
    id: "#8821",
    user: { name: "Bob Smith", email: "bob@example.com", avatar: "https://i.pravatar.cc/150?u=a04258114e29026708c" },
    subject: "Lost Item Inquiry",
    priority: "low",
    status: "closed",
    created: "1 day ago"
  },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
  open: "danger",
  "in-progress": "warning",
  closed: "success",
};

const priorityColorMap: Record<string, ChipProps["color"]> = {
  high: "danger",
  medium: "warning",
  low: "primary",
};

export default function SupportPage() {
  const [filterValue, setFilterValue] = React.useState("");

  const renderCell = React.useCallback((ticket: typeof tickets[0], columnKey: React.Key) => {
    switch (columnKey) {
      case "id":
        return <span className="font-mono text-default-500">{ticket.id}</span>;
      case "user":
        return (
          <User
            avatarProps={{ radius: "lg", src: ticket.user.avatar, size: "sm" }}
            description={ticket.user.email}
            name={ticket.user.name}
          />
        );
      case "subject":
        return <span className="font-semibold">{ticket.subject}</span>;
      case "status":
        return (
          <Chip
            className="capitalize border-none gap-1 text-default-600"
            color={statusColorMap[ticket.status]}
            size="sm"
            variant="dot"
          >
            {ticket.status}
          </Chip>
        );
      case "priority":
        return (
          <Chip
            className="capitalize"
            color={priorityColorMap[ticket.priority]}
            size="sm"
            variant="flat"
          >
            {ticket.priority}
          </Chip>
        )
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Reply">
              <span className="cursor-pointer text-lg text-default-400 active:opacity-50 hover:text-default-500">
                <MessageSquare size={18} />
              </span>
            </Tooltip>
            {ticket.status !== 'closed' && (
              <Tooltip color="success" content="Mark Resolved">
                <span className="cursor-pointer text-lg text-success active:opacity-50 hover:text-success-400">
                  <CheckCircle size={18} />
                </span>
              </Tooltip>
            )}
          </div>
        );
      default: {
        const val = ticket[columnKey as keyof typeof ticket];
        return (typeof val === "string" || typeof val === "number") ? val : null;
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-default-500 text-sm">Handle user and driver inquiries.</p>
        </div>
      </div>

      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          classNames={{
            base: "w-full sm:max-w-[44%]",
            inputWrapper: "border-1",
          }}
          placeholder="Search tickets..."
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
        aria-label="Support tickets table"
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
        <TableBody items={tickets}>
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
