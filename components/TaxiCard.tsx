import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { iTaxi } from "@/types";
import { useRide } from "@/context/RideContext";

interface TaxiCardProps {
  taxi: iTaxi;
  showSelect?: boolean;
}

const TaxiCard: React.FC<TaxiCardProps> = ({ taxi, showSelect = true }) => {
  const { setSelectedTaxi } = useRide();
  const router = useRouter();

  const onSelectTaxi = () => {
    setSelectedTaxi(taxi);
    router.push("/ride/track");
  };

  return (
    <Card className="shadow-sm">
      <CardBody className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-default-100 rounded-full flex items-center justify-center">
              <Icon className="text-2xl text-default-400" icon="lucide:user" />
            </div>

            <div>
              <h3 className="font-medium">{taxi.driverName}</h3>
              <div className="flex items-center text-xs text-default-500 mt-1">
                <Icon className="text-warning mr-1" icon="lucide:star" />
                <span>{taxi.rating}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-medium text-primary">
              {taxi.distance}
            </div>
            <div className="text-xs text-default-500 mt-1">ETA: {taxi.eta}</div>
          </div>
        </div>

        <div className="mt-3 text-sm">
          <div className="flex items-center gap-2">
            <Icon className="text-default-500" icon="lucide:taxi" />
            <span>{taxi.vehicleInfo}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Icon className="text-default-500" icon="lucide:tag" />
            <span>{taxi.licensePlate}</span>
          </div>
        </div>

        <Divider className="my-3" />

        <div className="flex justify-between items-center">
          <div className="flex items-center text-xs text-default-500">
            <Icon className="mr-1" icon="lucide:credit-card" />
            <span>Cash payment</span>
          </div>
          {showSelect && (
            <Button color="primary" size="sm" onPress={onSelectTaxi}>
              Select Taxi
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default TaxiCard;
