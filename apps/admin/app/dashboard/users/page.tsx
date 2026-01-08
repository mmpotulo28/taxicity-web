"use client";
import React, { useState } from "react";
import {
 Card,
 CardBody,
 Table,
 TableHeader,
 TableBody,
 TableColumn,
 TableRow,
 TableCell,
 Breadcrumbs,
 BreadcrumbItem,
 Button,
 Chip,
 Input,
 User,
 Dropdown,
 DropdownTrigger,
 DropdownMenu,
 DropdownItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";
import { adminUsers } from "@/lib/data";
import { iAdminUser } from "@/types";

export default function UsersPage() {
 const [searchQuery, setSearchQuery] = useState("");
 const [filteredUsers, setFilteredUsers] = useState<iAdminUser[]>(adminUsers);


 const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  const query = e.target.value.toLowerCase();
  setSearchQuery(query);

  const filtered = adminUsers.filter(user =>
   user.name.toLowerCase().includes(query) ||
   user.email.toLowerCase().includes(query) ||
   user.role.toLowerCase().includes(query)
  );
  setFilteredUsers(filtered);
 };

 const handleInvite = () => {
  addToast({
   title: "Invitation Sent",
   description: "An email has been sent to the new user.",
   color: "success",
  });
 };

 return (
  <div className="p-6">
   <Breadcrumbs className="mb-6">
    <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
    <BreadcrumbItem>Admin Users</BreadcrumbItem>
   </Breadcrumbs>

   <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold">Admin Users</h1>
    <Button color="primary" startContent={<Icon icon="lucide:plus" />} onPress={handleInvite}>
     Invite User
    </Button>
   </div>

   <Card>
    <CardBody>
     <div className="mb-4 w-full md:w-1/3">
      <Input
       placeholder="Search users..."
       startContent={<Icon icon="lucide:search" className="text-default-400" />}
       value={searchQuery}
       onChange={handleSearch}
      />
     </div>

     <Table aria-label="Admin Users Table">
      <TableHeader>
       <TableColumn>USER</TableColumn>
       <TableColumn>ROLE</TableColumn>
       <TableColumn>STATUS</TableColumn>
       <TableColumn>LAST LOGIN</TableColumn>
       <TableColumn>ACTIONS</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No users found">
       {filteredUsers.map((user) => (
        <TableRow key={user.id}>
         <TableCell>
          <User
           name={user.name}
           description={user.email}
           avatarProps={{ src: user.avatar, name: user.name }}
          />
         </TableCell>
         <TableCell>
          <Chip size="sm" variant="flat" color={user.role === "Super Admin" ? "danger" : "primary"}>
           {user.role}
          </Chip>
         </TableCell>
         <TableCell>
          <Chip
           size="sm"
           color={user.status === "active" ? "success" : "default"}
           variant="dot"
          >
           {user.status === "active" ? "Active" : "Inactive"}
          </Chip>
         </TableCell>
         <TableCell>
          {new Date(user.lastLogin).toLocaleDateString()} {new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
         </TableCell>
         <TableCell>
          <Dropdown>
           <DropdownTrigger>
            <Button isIconOnly variant="light" size="sm">
             <Icon icon="lucide:more-vertical" />
            </Button>
           </DropdownTrigger>
           <DropdownMenu aria-label="User Actions">
            <DropdownItem key="edit" startContent={<Icon icon="lucide:edit" />}>Edit Role</DropdownItem>
            <DropdownItem key="password" startContent={<Icon icon="lucide:key" />}>Reset Password</DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger" startContent={<Icon icon="lucide:trash" />}>
             Remove User
            </DropdownItem>
           </DropdownMenu>
          </Dropdown>
         </TableCell>
        </TableRow>
       ))}
      </TableBody>
     </Table>
    </CardBody>
   </Card>
  </div>
 );
}
