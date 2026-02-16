import { Card, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";

export interface StatsCardProps {
 title: string;
 value: number | string;
 icon: string;
 color?: "primary" | "success" | "warning" | "secondary" | "danger" | "default";
}

const StatsCards: React.FC<{ stats: StatsCardProps[]; className?: string }> = ({ stats, className }) => {
 const getColorClasses = (color?: string) => {
  switch (color) {
   case "success": return { icon: "text-success", bg: "bg-success-100" };
   case "warning": return { icon: "text-warning", bg: "bg-warning-100" };
   case "secondary": return { icon: "text-secondary", bg: "bg-secondary-100" };
   case "danger": return { icon: "text-danger", bg: "bg-danger-100" };
   default: return { icon: "text-primary", bg: "bg-primary-50" };
  }
 };

 return (
  <div className={className || "lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4"}>
   {stats?.map(({ title, value, icon, color }) => {
    const { icon: iconColor, bg: bgColor } = getColorClasses(color);
    return (
     <Card key={title}>
      <CardBody className="p-4">
       <div className="flex items-center justify-between">
        <div>
         <p className="text-sm text-default-500">{title}</p>
         <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
         <Icon icon={icon} className={`text-2xl ${iconColor}`} />
        </div>
       </div>
      </CardBody>
     </Card>
    );
   })}
  </div>
 );
};

export default StatsCards;