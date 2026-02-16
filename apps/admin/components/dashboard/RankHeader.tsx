import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface RankHeaderProps {
 name: string;
 isActive: boolean;
 city: string;
 province: string;
 id: string;
}

export const RankHeader = ({ name, isActive, city, province, id }: RankHeaderProps) => {
 return (
  <div className="flex items-center justify-between">
   <div>
    <div className="flex items-center gap-3">
     <h1 className="text-3xl font-bold">{name}</h1>
     <Chip color={isActive ? "success" : "default"} variant="flat">
      {isActive ? "Active" : "Inactive"}
     </Chip>
    </div>
    <p className="text-default-500 mt-1">
     {city}, {province}
    </p>
   </div>
   <div className="flex gap-2">
    <Link href={`/dashboard/ranks/${id}/performance`}>
     <Button variant="flat" color="primary" startContent={<Icon icon="lucide:bar-chart" />}>
      Performance
     </Button>
    </Link>
    <Link href="/dashboard/ranks">
     <Button variant="light" startContent={<Icon icon="lucide:arrow-left" />}>
      Back
     </Button>
    </Link>
   </div>
  </div>
 );
};
