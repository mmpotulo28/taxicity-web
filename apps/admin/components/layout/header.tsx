"use client";

import {
 Navbar,
 NavbarContent,
 NavbarItem,
 Button,
 Avatar,
 Dropdown,
 DropdownTrigger,
 DropdownMenu,
 DropdownItem,
 Input,
 Kbd,
} from "@heroui/react";
import { Menu, Bell, Search, Settings } from "lucide-react";

interface HeaderProps {
 onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
 return (
  <Navbar
   maxWidth="full"
   position="sticky"
   className="border-b border-default-100 bg-background/70 backdrop-blur-xl md:pl-72"
   classNames={{
    wrapper: "px-4 md:px-6",
   }}
  >
   <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
    <Button
     isIconOnly
     variant="light"
     className="md:hidden"
     onPress={onMenuClick}
    >
     <Menu />
    </Button>
    <div className="hidden lg:flex">
     <h2 className="text-lg font-semibold text-default-700">Dashboard</h2>
    </div>
   </NavbarContent>

   <NavbarContent justify="end" className="gap-4">
    <NavbarItem className="hidden lg:flex">
     <Input
      classNames={{
       base: "max-w-full sm:max-w-[10rem] h-10",
       mainWrapper: "h-full",
       input: "text-small",
       inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
      }}
      placeholder="Type to search..."
      size="sm"
      startContent={<Search size={18} />}
      type="search"
      endContent={<Kbd keys={["command"]}>K</Kbd>}
     />
    </NavbarItem>
    <NavbarItem>
     <Button isIconOnly variant="light" radius="full" aria-label="Notifications">
      <Bell size={20} className="text-default-500" />
     </Button>
    </NavbarItem>
    <NavbarItem>
     <Button isIconOnly variant="light" radius="full" aria-label="Settings">
      <Settings size={20} className="text-default-500" />
     </Button>
    </NavbarItem>

    <Dropdown placement="bottom-end">
     <DropdownTrigger>
      <Avatar
       as="button"
       className="transition-transform ring-2 ring-primary ring-offset-2 ring-offset-background"
       color="primary"
       name="Admin"
       size="sm"
       src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
      />
     </DropdownTrigger>
     <DropdownMenu aria-label="Profile Actions" variant="flat">
      <DropdownItem key="profile" className="h-14 gap-2">
       <p className="font-semibold">Signed in as</p>
       <p className="font-semibold">admin@taxicity.com</p>
      </DropdownItem>
      <DropdownItem key="settings">My Settings</DropdownItem>
      <DropdownItem key="active_sessions">Active Sessions</DropdownItem>
      <DropdownItem key="logout" color="danger">
       Log Out
      </DropdownItem>
     </DropdownMenu>
    </Dropdown>
   </NavbarContent>
  </Navbar>
 );
}
