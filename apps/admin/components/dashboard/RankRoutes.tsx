import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface Route {
 id: string;
 name: string;
 distance: number;
 baseFare: number | string;
 status: string;
 destRank?: { name: string; city: string };
 sourceRank?: { name: string; city: string };
}

interface RankRoutesProps {
 sourceRoutes: Route[];
 destRoutes: Route[];
 totalRoutes: number;
}

export const RankRoutes = ({ sourceRoutes, destRoutes, totalRoutes }: RankRoutesProps) => {
 if (totalRoutes === 0) return null;

 return (
  <Card className="lg:col-span-3">
   <CardHeader>
    <h2 className="text-xl font-semibold flex items-center gap-2">
     <Icon icon="lucide:route" />
     Connected Routes
    </h2>
   </CardHeader>
   <CardBody className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
    {sourceRoutes.length > 0 && (
     <div>
      <h3 className="text-sm font-semibold text-default-600 mb-2">
       Outbound Routes ({sourceRoutes.length})
      </h3>
      <div className="grid grid-cols-1 gap-3 px-4">
       {sourceRoutes.map((route) => (
        <Link key={route.id} href={`/dashboard/routes/${route.id}`}>
         <Card className="hover:bg-default-100 transition" shadow="none">
          <CardBody className="p-3">
           <div className="flex items-start justify-between">
            <div className="flex-1">
             <p className="text-sm font-medium">{route.name}</p>
             <p className="text-xs text-default-500 mt-1">
              To {route.destRank?.name || "Unknown"}, {route.destRank?.city || ""}
             </p>
             <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1">
               <Icon icon="lucide:navigation" className="w-3 h-3" />
               {route.distance} km
              </span>
              <span className="flex items-center gap-1 text-success">
               <Icon icon="lucide:banknote" className="w-3 h-3" />
               R{Number(route.baseFare).toFixed(2)}
              </span>
             </div>
            </div>
            <Chip size="sm" color={route.status === "ACTIVE" ? "success" : "default"} variant="flat">
             {route.status}
            </Chip>
           </div>
          </CardBody>
         </Card>
        </Link>
       ))}
      </div>
     </div>
    )}

    {destRoutes.length > 0 && (
     <div className="w-full">
      <h3 className="text-sm font-semibold text-default-600 mb-2">
       Inbound Routes ({destRoutes.length})
      </h3>
      <div className="grid grid-cols-1 gap-3 px-4">
       {destRoutes.map((route) => (
        <Link className="flex w-full" key={route.id} href={`/dashboard/routes/${route.id}`}>
         <Card className="hover:bg-default-100 transition w-full" shadow="none">
          <CardBody className="p-3">
           <div className="flex items-start justify-between">
            <div className="flex-1">
             <p className="text-sm font-medium">{route.name}</p>
             <p className="text-xs text-default-500 mt-1">
              From {route.sourceRank?.name || "Unknown"}, {route.sourceRank?.city || ""}
             </p>
             <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1">
               <Icon icon="lucide:navigation" className="w-3 h-3" />
               {route.distance} km
              </span>
              <span className="flex items-center gap-1 text-success">
               <Icon icon="lucide:banknote" className="w-3 h-3" />
               R{Number(route.baseFare).toFixed(2)}
              </span>
             </div>
            </div>
            <Chip size="sm" color={route.status === "ACTIVE" ? "success" : "default"} variant="flat">
             {route.status}
            </Chip>
           </div>
          </CardBody>
         </Card>
        </Link>
       ))}
      </div>
     </div>
    )}
   </CardBody>
  </Card>
 );
};
