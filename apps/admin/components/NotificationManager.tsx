"use client";
import React, { useState } from "react";
import {
 Button,
 Card,
 CardHeader,
 CardBody,
 Input,
 Textarea,
 Modal,
 ModalContent,
 ModalHeader,
 ModalBody,
 ModalFooter,
 useDisclosure,
 Select,
 SelectItem,
 Chip,
 Table,
 TableHeader,
 TableColumn,
 TableBody,
 TableRow,
 TableCell
} from "@heroui/react";
import axios from "axios";
import { Icon } from "@iconify/react";
import { useNotifications } from "../hooks/useNotifications";

const NOTIFICATION_TYPES = [
 { key: "INFO", label: "Info" },
 { key: "SUCCESS", label: "Success" },
 { key: "WARNING", label: "Warning" },
 { key: "ERROR", label: "Error" },
 { key: "TRIP_UPDATE", label: "Trip Update" },
 { key: "PAYMENT", label: "Payment" },
];

interface NotificationItem {
 id: string;
 title: string;
 message: string;
 type: string;
 userId: string;
 createdAt: string;
}

export const NotificationManager = () => {
 const { notifications, isLoading, mutate } = useNotifications();
 const { isOpen, onOpen, onOpenChange } = useDisclosure();

 // Form State
 const [title, setTitle] = useState("");
 const [message, setMessage] = useState("");
 const [type, setType] = useState<string>("INFO");
 const [userId, setUserId] = useState(""); // Empty = Broadcast
 const [isSending, setIsSending] = useState(false);


 const handleSend = async (onClose: () => void) => {
  if (!title || !message) return;

  setIsSending(true);
  try {
   await axios.post("/api/notifications", {
    title,
    message,
    type,
    userId: userId.trim() || undefined
   });
   mutate();
   onClose();
   // Reset form
   setTitle("");
   setMessage("");
   setType("INFO");
   setUserId("");
  } catch (err) {
   console.error(err);
   alert("Failed to send notification");
  } finally {
   setIsSending(false);
  }
 };

 return (
  <Card className="p-4 mt-6">
   <CardHeader className="flex justify-between items-center px-4">
    <div className="flex gap-2 items-center">
     <Icon icon="lucide:bell" width={24} />
     <h3 className="text-xl font-bold">Notifications System</h3>
    </div>
    <Button color="primary" onPress={onOpen} startContent={<Icon icon="lucide:send" />}>
     Send Notification
    </Button>
   </CardHeader>
   <CardBody>
    <Table aria-label="Notifications Table">
     <TableHeader>
      <TableColumn>TITLE</TableColumn>
      <TableColumn>MESSAGE</TableColumn>
      <TableColumn>TYPE</TableColumn>
      <TableColumn>TARGET</TableColumn>
      <TableColumn>DATE</TableColumn>
     </TableHeader>
     <TableBody
      isLoading={isLoading}
      items={notifications || []}
      emptyContent="No notifications found"
     >
      {(item: NotificationItem) => (
       <TableRow key={item.id}>
        <TableCell className="font-medium">{item.title}</TableCell>
        <TableCell>
         <div className="truncate max-w-xs text-default-500">
          {item.message}
         </div>
        </TableCell>
        <TableCell>
         <Chip
          size="sm"
          color={
           item.type === 'ERROR' ? 'danger' :
            item.type === 'WARNING' ? 'warning' :
             item.type === 'SUCCESS' ? 'success' :
              'default'
          }
          variant="flat"
         >
          {item.type}
         </Chip>
        </TableCell>
        <TableCell>
         {item.userId === 'ALL' ? (
          <Chip size="sm" color="primary" variant="dot">Broadcast</Chip>
         ) : (
          <span className="font-mono text-xs">{item.userId}</span>
         )}
        </TableCell>
        <TableCell className="text-default-400 text-xs">
         {new Date(item.createdAt).toLocaleString()}
        </TableCell>
       </TableRow>
      )}
     </TableBody>
    </Table>
   </CardBody>

   <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
    <ModalContent>
     {(onClose) => (
      <>
       <ModalHeader>Send Notification</ModalHeader>
       <ModalBody>
        <Input
         label="Title"
         placeholder="Important Update"
         value={title}
         onValueChange={setTitle}
         isRequired
        />
        <Textarea
         label="Message"
         placeholder="Please describe the notification..."
         value={message}
         onValueChange={setMessage}
         isRequired
        />
        <Select
         label="Type"
         selectedKeys={new Set([type])}
         onSelectionChange={(keys) => setType(Array.from(keys)[0] as string)}
        >
         {NOTIFICATION_TYPES.map((t) => (
          <SelectItem key={t.key}>
           {t.label}
          </SelectItem>
         ))}
        </Select>
        <Input
         label="Target User ID (Optional)"
         placeholder="e.g. user_2p..."
         value={userId}
         onValueChange={setUserId}
         description="Leave empty to broadcast to ALL users."
        />
       </ModalBody>
       <ModalFooter>
        <Button variant="flat" onPress={onClose}>Cancel</Button>
        <Button color="primary" onPress={() => handleSend(onClose)} isLoading={isSending}>
         Send Notification
        </Button>
       </ModalFooter>
      </>
     )}
    </ModalContent>
   </Modal>
  </Card>
 );
};
