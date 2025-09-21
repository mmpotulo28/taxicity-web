import React from "react";
import { motion } from "framer-motion";
import { 
  Button, 
  Card, 
  CardBody, 
  Divider,
  Progress
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface TripDetailsProps {
  pickupLocation: string;
  dropoffLocation: string;
  taxiId: string;
  onRideComplete: () => void;
}

export const TripDetails: React.FC<TripDetailsProps> = ({ 
  pickupLocation, 
  dropoffLocation, 
  onRideComplete 
}) => {
  const [progress, setProgress] = React.useState(0);
  const [remainingTime, setRemainingTime] = React.useState(15);
  const [showPayment, setShowPayment] = React.useState(false);
  
  // Simulate trip progress
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setShowPayment(true);
          return 100;
        }
        return newProgress;
      });
      
      setRemainingTime(prev => {
        const newTime = prev - 0.75;
        return Math.max(newTime, 0);
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Your Trip</h2>
        <p className="text-default-500 text-sm mb-4">
          {showPayment ? "You've arrived at your destination" : "On the way to your destination"}
        </p>
        
        {!showPayment && (
          <>
            <Progress 
              value={progress} 
              color="primary"
              className="mb-2"
              aria-label="Trip progress"
            />
            
            <div className="flex justify-between text-xs text-default-500 mb-4">
              <span>In progress</span>
              <span>
                {remainingTime.toFixed(0)} min remaining
              </span>
            </div>
          </>
        )}
        
        <Card className="mb-4">
          <CardBody className="p-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div className="w-0.5 h-10 bg-default-200" />
                <div className="w-3 h-3 rounded-full bg-danger" />
              </div>
              
              <div className="flex-1">
                <div className="mb-2">
                  <div className="text-sm font-medium">Pickup</div>
                  <div className="text-xs text-default-500">{pickupLocation}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Drop-off</div>
                  <div className="text-xs text-default-500">{dropoffLocation}</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hidden">
        {showPayment ? (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-sm">
              <CardBody className="p-4">
                <h3 className="text-lg font-semibold mb-2">Payment</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-default-500">Base fare</span>
                    <span>R15.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-500">Distance (5.2 km)</span>
                    <span>R10.40</span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>R25.40</span>
                  </div>
                </div>
                
                <div className="bg-default-50 p-3 rounded-medium mb-4">
                  <div className="flex items-start gap-3">
                    <Icon icon="lucide:info" className="text-primary mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Cash Payment</h4>
                      <p className="text-xs text-default-500 mt-1">
                        Please pay the driver directly with cash. Exact change is appreciated.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  color="primary" 
                  className="w-full mb-2"
                  onPress={onRideComplete}
                >
                  Complete Trip
                </Button>
                
                <Button 
                  variant="flat" 
                  color="primary"
                  className="w-full"
                  startContent={<Icon icon="lucide:qr-code" />}
                >
                  Show Payment QR Code
                </Button>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-4">
                <h3 className="font-medium mb-3">Rate your trip</h3>
                
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button 
                      key={star}
                      isIconOnly 
                      variant="light" 
                      className="text-warning"
                    >
                      <Icon icon="lucide:star" className="text-2xl" />
                    </Button>
                  ))}
                </div>
                
                <Button 
                  variant="light" 
                  color="primary"
                  className="w-full"
                  startContent={<Icon icon="lucide:message-square" />}
                >
                  Leave Feedback
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-default-100 rounded-full flex items-center justify-center">
                    <Icon icon="lucide:user" className="text-xl text-default-400" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Sipho Mabena</h3>
                    <div className="flex items-center text-xs text-default-500">
                      <Icon icon="lucide:star" className="text-warning mr-1" />
                      <span>4.8</span>
                    </div>
                  </div>
                  
                  <Button 
                    isIconOnly 
                    variant="flat" 
                    color="primary"
                    className="ml-auto"
                    aria-label="Call driver"
                  >
                    <Icon icon="lucide:phone" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-default-500">Vehicle</div>
                    <div>Toyota Quantum - White</div>
                  </div>
                  <div>
                    <div className="text-default-500">License Plate</div>
                    <div>GP 123-456</div>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <div className="bg-default-50 p-3 rounded-medium">
              <div className="flex items-start gap-3">
                <Icon icon="lucide:info" className="text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Trip Information</h4>
                  <ul className="text-xs text-default-500 mt-1 space-y-1">
                    <li>
                      <span className="font-medium">Distance:</span> 5.2 km
                    </li>
                    <li>
                      <span className="font-medium">Estimated fare:</span> R25.40
                    </li>
                    <li>
                      <span className="font-medium">Payment method:</span> Cash
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button 
              color="danger" 
              variant="light"
              className="w-full"
              startContent={<Icon icon="lucide:alert-triangle" />}
            >
              Emergency Assistance
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};