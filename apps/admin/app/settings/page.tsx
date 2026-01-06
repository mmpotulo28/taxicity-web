"use client";

import {
 Tabs,
 Tab,
 Card,
 CardBody,
 Input,
 Button,
 Switch,
 Avatar,
 Select,
 SelectItem
} from "@heroui/react";
import { User, Bell, Globe, Shield } from "lucide-react";
import React from "react";

export default function SettingsPage() {
 return (
  <div className="flex w-full flex-col space-y-6">
   <div className="flex flex-col gap-2">
    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
    <p className="text-default-500 text-sm">Manage your account preferences and system configurations.</p>
   </div>

   <Tabs aria-label="Settings options" color="primary" variant="underlined" classNames={{
    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
    cursor: "w-full bg-primary",
    tab: "max-w-fit px-0 h-12",
    tabContent: "group-data-[selected=true]:text-primary"
   }}>
    {/* Profile Settings */}
    <Tab
     key="profile"
     title={
      <div className="flex items-center space-x-2">
       <User size={18} />
       <span>Profile</span>
      </div>
     }
    >
     <Card className="shadow-sm border border-default-100 bg-content1 mt-4">
      <CardBody className="p-6 gap-6">
       <div className="flex items-center gap-4">
        <Avatar src="https://i.pravatar.cc/150?u=a04258114e29026708c" className="w-20 h-20 text-large" />
        <div>
         <Button size="sm" variant="flat" color="primary">Change Avatar</Button>
         <p className="text-xs text-default-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
        </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First Name" placeholder="Manelisi" variant="bordered" />
        <Input label="Last Name" placeholder="M" variant="bordered" />
        <Input label="Email" placeholder="admin@taxicity.com" variant="bordered" />
        <Input label="Phone" placeholder="+27 12 345 6789" variant="bordered" />
       </div>
       <div className="flex justify-end mt-4">
        <Button color="primary">Save Changes</Button>
       </div>
      </CardBody>
     </Card>
    </Tab>

    {/* Notification Settings */}
    <Tab
     key="notifications"
     title={
      <div className="flex items-center space-x-2">
       <Bell size={18} />
       <span>Notifications</span>
      </div>
     }
    >
     <Card className="shadow-sm border border-default-100 bg-content1 mt-4">
      <CardBody className="p-6 gap-6">
       <div className="flex justify-between items-center pb-4 border-b border-divider">
        <div>
         <p className="font-semibold">Email Notifications</p>
         <p className="text-small text-default-500">Receive emails about your account activity.</p>
        </div>
        <Switch defaultSelected color="primary" />
       </div>
       <div className="flex justify-between items-center pb-4 border-b border-divider">
        <div>
         <p className="font-semibold">System Alerts</p>
         <p className="text-small text-default-500">Get notified about system maintenance and updates.</p>
        </div>
        <Switch defaultSelected color="primary" />
       </div>
       <div className="flex justify-between items-center">
        <div>
         <p className="font-semibold">Driver Approvals</p>
         <p className="text-small text-default-500">Receive alerts when new drivers register.</p>
        </div>
        <Switch defaultSelected color="primary" />
       </div>
      </CardBody>
     </Card>
    </Tab>

    {/* System Settings */}
    <Tab
     key="system"
     title={
      <div className="flex items-center space-x-2">
       <Globe size={18} />
       <span>System</span>
      </div>
     }
    >
     <Card className="shadow-sm border border-default-100 bg-content1 mt-4">
      <CardBody className="p-6 gap-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Language" placeholder="English" defaultSelectedKeys={["en"]} variant="bordered">
         <SelectItem key="en">English</SelectItem>
         <SelectItem key="es">Zulu</SelectItem>
         <SelectItem key="fr">Xhosa</SelectItem>
        </Select>
        <Select label="Timezone" placeholder="(GMT+02:00) South Africa Standard Time" variant="bordered">
         <SelectItem key="sa">South Africa Standard Time</SelectItem>
        </Select>
       </div>
       <div className="flex justify-end mt-4">
        <Button color="primary">Update System</Button>
       </div>
      </CardBody>
     </Card>
    </Tab>

    {/* Security Settings */}
    <Tab
     key="security"
     title={
      <div className="flex items-center space-x-2">
       <Shield size={18} />
       <span>Security</span>
      </div>
     }
    >
     <Card className="shadow-sm border border-default-100 bg-content1 mt-4">
      <CardBody className="p-6 gap-6">
       <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Change Password</h3>
        <Input label="Current Password" type="password" variant="bordered" />
        <Input label="New Password" type="password" variant="bordered" />
        <Input label="Confirm New Password" type="password" variant="bordered" />
        <div className="flex justify-end">
         <Button color="primary">Update Password</Button>
        </div>
       </div>
      </CardBody>
     </Card>
    </Tab>
   </Tabs>
  </div>
 );
}
