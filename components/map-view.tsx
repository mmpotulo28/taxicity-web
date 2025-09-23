import React from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Avatar, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRide } from "@/context/RideContext";
import TripCard from "./TripCard";

export const MapView: React.FC = () => {
	return (
		<div className="relative flex-1 rounded-xl overflow-hidden mx-4 mb-4 shadow-lg">
			<div className="absolute inset-0 bg-slate-100">
				<div
					className="h-full w-full bg-cover bg-center"
					style={{
						backgroundImage: `url(https://img.heroui.chat/image/places?w=800&h=1200&u=map-bg)`,
						filter: "saturate(0.8) brightness(1.05)",
					}}>
					{/* Taxi Markers */}
					<div className="absolute top-1/4 left-1/3">
						<motion.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{
								repeat: Infinity,
								repeatType: "reverse",
								duration: 1,
							}}>
							<Icon icon="lucide:taxi" className="text-primary text-2xl" />
						</motion.div>
					</div>
					<div className="absolute top-1/2 right-1/4">
						<motion.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{
								repeat: Infinity,
								repeatType: "reverse",
								duration: 1,
								delay: 0.3,
							}}>
							<Icon icon="lucide:taxi" className="text-primary text-2xl" />
						</motion.div>
					</div>
					<div className="absolute bottom-1/3 left-1/2">
						<motion.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{
								repeat: Infinity,
								repeatType: "reverse",
								duration: 1,
								delay: 0.6,
							}}>
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
		</div>
	);
};
