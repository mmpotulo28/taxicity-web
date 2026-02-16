"use client";

import React, { useState } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import { useTaxis } from "@/hooks/useTaxis";
import { Icon } from "@iconify/react";
import { Card, CardBody, Chip } from "@heroui/react";

export default function LiveMap() {
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
	const { taxis, isLoading } = useTaxis();
	const [selectedTaxiId, setSelectedTaxiId] = useState<string | null>(null);

	if (!apiKey) {
		return (
			<div className="flex items-center justify-center h-[600px] bg-default-100 rounded-lg">
				<p className="text-default-500">
					Map unavailable - Missing <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable
				</p>
			</div>
		);
	}

	const selectedTaxi = taxis?.find(t => t.id === selectedTaxiId);

	return (
		<APIProvider apiKey={apiKey}>
			<div className="relative h-[600px] rounded-xl overflow-hidden shadow-sm border border-default-200">
				<Map
					{...({ mapId } as any)}
					defaultCenter={{ lat: -26.2041, lng: 28.0473 }} // Joburg default
					defaultZoom={11}
					style={{ width: "100%", height: "100%" }}
					gestureHandling="auto"
					disableDefaultUI={false}
				>
					{taxis?.filter(t => t.currentLocation).map((taxi) => (
						<TaxiMarker
							key={taxi.id}
							taxi={taxi}
							onClick={() => setSelectedTaxiId(taxi.id)}
						/>
					))}

					{selectedTaxi && selectedTaxi.currentLocation && (
						<InfoWindow
							position={{ lat: selectedTaxi.currentLocation.lat, lng: selectedTaxi.currentLocation.lng }}
							onCloseClick={() => setSelectedTaxiId(null)}
						>
							<div className="p-2 min-w-[200px]">
								<div className="flex items-center gap-2 mb-2">
									<Icon icon="lucide:car" className="text-primary" />
									<span className="font-bold">{selectedTaxi.licensePlate}</span>
									<Chip size="sm" color={selectedTaxi.status === "AVAILABLE" ? "success" : (selectedTaxi.status === "MAINTENANCE" ? "secondary" : (selectedTaxi.status === "OFFLINE" ? "danger" : "warning"))} variant="flat">
										{selectedTaxi.status}
									</Chip>
								</div>
								<p className="text-xs text-default-500">{selectedTaxi.model} - {selectedTaxi.color}</p>
								{selectedTaxi.driver && (
									<div className="mt-2 flex items-center gap-2 border-t pt-2 border-default-100">
										<Icon icon="lucide:user" className="text-default-400" />
										<span className="text-sm">{selectedTaxi.driver.fullName}</span>
									</div>
								)}
							</div>
						</InfoWindow>
					)}
				</Map>

				{/* Legend/Stats overlay */}
				<div className="absolute top-4 right-4 z-10">
					<Card className="bg-background/80 backdrop-blur-md border-none shadow-lg">
						<CardBody className="p-3">
							<div className="flex flex-col gap-2">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-success"></div>
									<span className="text-xs font-medium">Available ({taxis?.filter(t => t.status === "AVAILABLE").length})</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-warning"></div>
									<span className="text-xs font-medium">Busy ({taxis?.filter(t => t.status === "BUSY").length})</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-secondary"></div>
									<span className="text-xs font-medium">Maintenance ({taxis?.filter(t => t.status === "MAINTENANCE").length})</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-danger"></div>
									<span className="text-xs font-medium">Offline ({taxis?.filter(t => t.status === "OFFLINE").length})</span>
								</div>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
		</APIProvider>
	);
}

function TaxiMarker({ taxi, onClick }: { taxi: any, onClick: () => void }) {
	const [markerRef, marker] = useAdvancedMarkerRef();
	const statusColor = taxi.status === "AVAILABLE" ? "#17c964" : (taxi.status === "MAINTENANCE" ? "#9353d3" : (taxi.status === "OFFLINE" ? "#f31260" : "#f5a524"));

	return (
		<AdvancedMarker
			ref={markerRef}
			position={{ lat: taxi.currentLocation.lat, lng: taxi.currentLocation.lng }}
			title={taxi.licensePlate}
			onClick={onClick}
		>
			<div className="relative group cursor-pointer">
				<div
					className="p-1.5 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-110"
					style={{ backgroundColor: statusColor }}
				>
					<Icon icon="lucide:car" className="text-white text-lg" />
				</div>
				<div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
					{taxi.licensePlate}
				</div>
			</div>
		</AdvancedMarker>
	);
}
