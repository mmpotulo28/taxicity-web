import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { iRank, iRoute } from "@/types";
import { useRide } from "@/context/RideContext";

interface RouteCardProps {
  route: iRoute;
  rank: iRank;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, rank }) => {
  const router = useRouter();
  const { setSelectedRoute, setSelectedRank } = useRide();

  const onRouteSelect = (route: iRoute, rank: iRank) => {
    setSelectedRoute(route);
    setSelectedRank(rank);
    // Navigate to location picker page
    router.push(
      "/ride/location?from=" +
        encodeURIComponent(route.name) +
        "&rank=" +
        encodeURIComponent(rank.name),
    );
  };

  return (
    <Card className="shadow-sm w-full">
      <CardBody className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Icon className="text-primary" icon="lucide:route" />
              <h3 className="font-medium">{route.name}</h3>
            </div>
            <div className="flex items-center gap-2 mt-2 text-default-500 text-sm">
              <Icon className="text-danger text-sm" icon="lucide:map-pin" />
              <span>{rank.name}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-success-100 text-success-600 text-xs px-2 py-0.5 rounded-full">
              Active
            </div>
            <div className="flex items-center mt-2 text-xs text-default-400">
              <Icon className="mr-1" icon="lucide:taxi" />
              <span>8 taxis available</span>
            </div>
          </div>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between items-center">
          <div className="text-xs text-default-500">
            <span className="font-medium">R15.00 - R25.00</span> estimated fare
          </div>
          <Button
            color="primary"
            endContent={<Icon icon="lucide:arrow-right" />}
            size="sm"
            variant="light"
            onPress={onRouteSelect.bind(null, route, rank)}
          >
            Select
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default RouteCard;
