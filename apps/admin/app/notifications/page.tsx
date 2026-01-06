"use client";

import {
 Card,
 CardBody,
 Button,
 Input,
 Textarea,
 Chip,
 Select,
 SelectItem
} from "@heroui/react";
import { Send, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import React from "react";

const notifications = [
 {
  id: 1,
  title: "High Demand in CBD",
  message: "Unusual high traffic of ride requests in Central Business District.",
  type: "info",
  time: "10 min ago",
  recipient: "All Drivers"
 },
 {
  id: 2,
  title: "System Maintenance",
  message: "Scheduled maintenance tonight at 02:00 AM. Services may be interrupted.",
  type: "warning",
  time: "2 hours ago",
  recipient: "All Users"
 },
 {
  id: 3,
  title: "Driver 1024 Suspended",
  message: "Driver account auto-suspended due to multiple reports.",
  type: "critical",
  time: "5 hours ago",
  recipient: "Admins"
 }
];

const typeColorMap: Record<string, string> = {
 info: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
 warning: "text-warning-500 bg-warning-100 dark:bg-warning-900/30",
 critical: "text-danger-500 bg-danger-100 dark:bg-danger-900/30",
 success: "text-success-500 bg-success-100 dark:bg-success-900/30",
};

const iconMap: Record<string, React.ReactNode> = {
 info: <Info size={20} />,
 warning: <AlertTriangle size={20} />,
 critical: <XCircle size={20} />,
 success: <CheckCircle size={20} />,
};

export default function NotificationsPage() {
 return (
  <div className="space-y-6">
   <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
     <h1 className="text-2xl font-bold tracking-tight">Notifications Center</h1>
     <p className="text-default-500 text-sm">Manage alerts and send communications to users and drivers.</p>
    </div>
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
    {/* Send Notification Panel */}
    <Card className="h-fit shadow-sm border border-default-100 bg-content1">
     <CardBody className="p-6 gap-6">
      <div className="flex items-center gap-2 pb-4 border-b border-divider">
       <Send size={20} className="text-primary" />
       <h3 className="font-semibold text-lg">Broadcast Message</h3>
      </div>

      <div className="flex flex-col gap-4">
       <Select label="Target Audience" placeholder="Select recipient group" variant="bordered">
        <SelectItem key="all_users">All Passengers</SelectItem>
        <SelectItem key="all_drivers">All Drivers</SelectItem>
        <SelectItem key="specific_user">Specific User</SelectItem>
       </Select>

       <Input label="Title" placeholder="Notification Title" variant="bordered" />

       <Textarea
        label="Message"
        placeholder="Type your message here..."
        variant="bordered"
        minRows={4}
       />

       <Select label="Priority" placeholder="Select priority" variant="bordered">
        <SelectItem key="normal">Normal (Info)</SelectItem>
        <SelectItem key="high">High (Warning)</SelectItem>
        <SelectItem key="urgent">Urgent (Critical)</SelectItem>
       </Select>

       <Button color="primary" endContent={<Send size={16} />} className="w-full">
        Send Notification
       </Button>
      </div>
     </CardBody>
    </Card>

    {/* Notification History */}
    <div className="lg:col-span-2 space-y-4">
     <h3 className="font-semibold text-lg px-2">Recent Alerts</h3>

     {notifications.map((notification) => (
      <Card key={notification.id} className="shadow-sm border border-default-100 bg-content1">
       <CardBody className="flex flex-row gap-4 p-4 items-start">
        <div className={`p-3 rounded-full flex-shrink-0 ${typeColorMap[notification.type]}`}>
         {iconMap[notification.type]}
        </div>
        <div className="flex-1">
         <div className="flex justify-between items-start">
          <h4 className="font-semibold text-default-900">{notification.title}</h4>
          <span className="text-xs text-default-400">{notification.time}</span>
         </div>
         <p className="text-sm text-default-500 mt-1">{notification.message}</p>
         <div className="flex gap-2 mt-3">
          <Chip size="sm" variant="flat" color="default" className="text-xs">
           To: {notification.recipient}
          </Chip>
         </div>
        </div>
       </CardBody>
      </Card>
     ))}
    </div>
   </div>
  </div>
 );
}
