import React from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

interface MapViewProps {
  onRequestRide: () => void;
}

export const MapView: React.FC<MapViewProps> = ({ onRequestRide }) => {
  return (
    <div className="relative h-full">
      {/* Map Container */}
      <div className="absolute inset-0 bg-slate-100">
        {/* Simulated Map with a placeholder image */}
        <div 
          className="h-full w-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url(https://img.heroui.chat/image/places?w=800&h=1200&u=map-bg)`,
            filter: 'saturate(0.8) brightness(1.05)'
          }}
        >
          {/* Taxi Markers */}
          <div className="absolute top-1/4 left-1/3">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
            >
              <Icon icon="lucide:taxi" className="text-primary text-2xl" />
            </motion.div>
          </div>
          <div className="absolute top-1/2 right-1/4">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1, delay: 0.3 }}
            >
              <Icon icon="lucide:taxi" className="text-primary text-2xl" />
            </motion.div>
          </div>
          <div className="absolute bottom-1/3 left-1/2">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1, delay: 0.6 }}
            >
              <Icon icon="lucide:taxi" className="text-primary text-2xl" />
            </motion.div>
          </div>
          
          {/* Taxi Ranks */}
          <div className="absolute top-1/3 right-1/3">
            <div className="bg-white p-1 rounded-full shadow-md">
              <Icon icon="lucide:map-pin" className="text-danger text-xl" />
            </div>
            <div className="text-tiny bg-white px-2 py-0.5 rounded-md shadow-sm mt-1 text-center">
              Central Rank
            </div>
          </div>
          <div className="absolute bottom-1/4 left-1/3">
            <div className="bg-white p-1 rounded-full shadow-md">
              <Icon icon="lucide:map-pin" className="text-danger text-xl" />
            </div>
            <div className="text-tiny bg-white px-2 py-0.5 rounded-md shadow-sm mt-1 text-center">
              South Rank
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button 
          isIconOnly 
          color="default" 
          variant="solid" 
          className="bg-white shadow-md"
          aria-label="Center map"
        >
          <Icon icon="lucide:crosshair" />
        </Button>
        <Button 
          isIconOnly 
          color="default" 
          variant="solid" 
          className="bg-white shadow-md"
          aria-label="Zoom in"
        >
          <Icon icon="lucide:plus" />
        </Button>
        <Button 
          isIconOnly 
          color="default" 
          variant="solid" 
          className="bg-white shadow-md"
          aria-label="Zoom out"
        >
          <Icon icon="lucide:minus" />
        </Button>
      </div>
      
      {/* Bottom Card */}
      <div className="absolute bottom-0 left-0 right-0">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="mx-4 mb-4 shadow-lg">
            <CardBody className="p-4">
              <h2 className="text-lg font-semibold mb-2">Ready to travel?</h2>
              <p className="text-default-500 text-sm mb-4">
                Find available taxis on your route and get to your destination safely.
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:info" className="text-primary" />
                  <span className="text-xs text-default-500">Cash & QR payments accepted</span>
                </div>
                <Button 
                  color="primary" 
                  onPress={onRequestRide}
                  endContent={<Icon icon="lucide:arrow-right" />}
                >
                  Request Taxi
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};