"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import Link from "next/link";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { io, Socket } from "socket.io-client";

interface ActiveTrip {
	id: string;
	status: string;
	pickupAddress: string;
	dropoffAddress: string;
	pickupLat: number;
	pickupLng: number;
	dropoffLat: number;
	dropoffLng: number;
	fare: number;
	route: {
		name: string;
	};
	vehicleTrip: {
		taxiId: string;
		driver: {
			fullName: string | null;
			firstName: string;
			lastName: string;
		};
		taxi: {
			model: string;
			licensePlate: string;
		};
	} | null;
	requestTime: string;
	currentLocation?: {
		lat: number;
		lng: number;
		heading?: number;
		speed?: number;
		timestamp: number;
	} | null;
}

function getTripStatusColor(status: string): "success" | "primary" | "warning" | "danger" | "default" {
	switch (status.toUpperCase()) {
		case "COMPLETED": return "success";
		case "IN_PROGRESS":
		case "ACCEPTED":
		case "ARRIVED_AT_PICKUP": return "primary";
		case "REQUESTED": return "warning";
		case "CANCELLED": return "danger";
		default: return "default";
	}
}

export default function LiveTrackingPage() {
	const searchParams = useSearchParams();
	const tripId = searchParams.get("tripId");
	const { getToken } = useAuth();

	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
	const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3002";

	const [activeTrips, setActiveTrips] = useState<ActiveTrip[]>([]);
	const [selectedTrip, setSelectedTrip] = useState<ActiveTrip | null>(null);
	const [loading, setLoading] = useState(true);
	const [mapCenter, setMapCenter] = useState({ lat: -26.2041, lng: 28.0473 }); // Johannesburg default
	const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
	const socketRef = useRef<Socket | null>(null);

	const fetchActiveTrips = useCallback(async () => {
		try {
			const response = await axios.get("/api/trips/live");
			const trips = response.data as ActiveTrip[];

			setActiveTrips(trips);

			// If tripId is provided, select that trip and center map on it
			if (tripId) {
				const trip = trips.find((t: ActiveTrip) => t.id === tripId);
				if (trip) {
					setSelectedTrip(trip);
					// Use current location if available, otherwise pickup location
					if (trip.currentLocation) {
						setMapCenter({ lat: trip.currentLocation.lat, lng: trip.currentLocation.lng });
					} else {
						setMapCenter({ lat: trip.pickupLat, lng: trip.pickupLng });
					}
				}
			} else if (trips.length > 0) {
				// Center map on average of all trips (use current location if available)
				const avgLat = trips.reduce((sum: number, t: ActiveTrip) => {
					const lat = t.currentLocation?.lat || t.pickupLat;
					return sum + lat;
				}, 0) / trips.length;
				const avgLng = trips.reduce((sum: number, t: ActiveTrip) => {
					const lng = t.currentLocation?.lng || t.pickupLng;
					return sum + lng;
				}, 0) / trips.length;
				setMapCenter({ lat: avgLat, lng: avgLng });
			}

			setLoading(false);
		} catch (error) {
			console.error("Error fetching active trips:", error);
			setLoading(false);
		}
	}, [tripId]);

	// WebSocket connection and real-time location updates
	useEffect(() => {
		let socket: Socket | null = null;

		const setupWebSocket = async () => {
			try {
				const token = await getToken();
				if (!token) {
					console.error("No auth token available");
					return;
				}

				// Connect to WebSocket server
				socket = io(wsUrl, {
					auth: { token },
					transports: ["websocket", "polling"],
				});

				socketRef.current = socket;

				socket.on("connect", () => {
					console.log("Connected to WebSocket server");

					// Subscribe to vehicle channels for all active trips
					activeTrips.forEach((trip) => {
						if (trip.vehicleTrip?.taxiId) {
							const channel = `vehicle-${trip.vehicleTrip.taxiId}`;
							socket?.emit("subscribe", channel);
							console.log(`Subscribed to ${channel}`);
						}
					});
				});

				// Listen for location updates
				socket.on("location-update", (data: { taxiId: string; lat: number; lng: number; heading?: number; speed?: number; timestamp: number }) => {
					console.log("Location update received:", data);

					// Update the trip with new location
					setActiveTrips((prevTrips) =>
						prevTrips.map((trip) =>
							trip.vehicleTrip?.taxiId === data.taxiId
								? {
									...trip,
									currentLocation: {
										lat: data.lat,
										lng: data.lng,
										heading: data.heading,
										speed: data.speed,
										timestamp: data.timestamp,
									},
								}
								: trip
						)
					);

					// If this is the selected trip, update selected trip state too
					setSelectedTrip((prevSelected) => {
						if (prevSelected && prevSelected.vehicleTrip?.taxiId === data.taxiId) {
							return {
								...prevSelected,
								currentLocation: {
									lat: data.lat,
									lng: data.lng,
									heading: data.heading,
									speed: data.speed,
									timestamp: data.timestamp,
								},
							};
						}
						return prevSelected;
					});
				});

				socket.on("connect_error", (error) => {
					console.error("WebSocket connection error:", error);
				});

				socket.on("disconnect", (reason) => {
					console.log("Disconnected from WebSocket:", reason);
				});
			} catch (error) {
				console.error("Error setting up WebSocket:", error);
			}
		};

		if (activeTrips.length > 0) {
			setupWebSocket();
		}

		// Cleanup on unmount
		return () => {
			if (socket) {
				// Unsubscribe from all channels
				activeTrips.forEach((trip) => {
					if (trip.vehicleTrip?.taxiId) {
						const channel = `vehicle-${trip.vehicleTrip.taxiId}`;
						socket?.emit("unsubscribe", channel);
					}
				});
				socket.disconnect();
			}
		};
	}, [activeTrips, getToken, wsUrl]);

	useEffect(() => {
		fetchActiveTrips();

		// Set up polling for backup updates every 10 seconds (in case WebSocket fails)
		const interval = setInterval(fetchActiveTrips, 10000);

		return () => clearInterval(interval);
	}, [fetchActiveTrips]);

	const handleTripSelect = (trip: ActiveTrip) => {
		setSelectedTrip(trip);
		setMapCenter({ lat: trip.pickupLat, lng: trip.pickupLng });
	};

	if (!apiKey) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card>
					<CardBody>
						<p className="text-danger">Map unavailable - Missing Google Maps API Key</p>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen">
			{/* Header */}
			<header className="bg-background border-b border-divider p-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold flex items-center gap-2">
							<Icon icon="lucide:radio" className="text-primary animate-pulse" />
							Live Trip Tracking
						</h1>
						<p className="text-sm text-default-500 mt-1">
							{activeTrips.length} active trip{activeTrips.length === 1 ? "" : "s"}
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="flat"
							startContent={<Icon icon="lucide:refresh-cw" />}
							onPress={fetchActiveTrips}>
							Refresh
						</Button>
						<Link href="/dashboard/trips">
							<Button size="sm" variant="light" startContent={<Icon icon="lucide:arrow-left" />}>
								Back to Trips
							</Button>
						</Link>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Sidebar - Active Trips List */}
				<div className="flex-1 border-r border-divider overflow-y-auto">
					<div className="p-4 space-y-3">
						{loading && (
							<Card>
								<CardBody className="text-center">
									<Icon icon="lucide:loader" className="animate-spin mx-auto text-2xl" />
									<p className="mt-2">Loading active trips...</p>
								</CardBody>
							</Card>
						)}

						{!loading && activeTrips.length === 0 && (
							<Card>
								<CardBody className="text-center py-8">
									<Icon icon="lucide:inbox" className="text-4xl text-default-300 mx-auto" />
									<p className="mt-2 text-default-500">No active trips</p>
								</CardBody>
							</Card>
						)}

						{!loading && activeTrips.length > 0 && activeTrips.map((trip) => (
							<Card
								key={trip.id}
								isPressable
								isHoverable
								className={`cursor-pointer transition-all ${selectedTrip?.id === trip.id ? "ring-2 ring-primary" : ""
									}`}
								onPress={() => handleTripSelect(trip)}>
								<CardBody className="p-3">
									<div className="flex items-start justify-between mb-2">
										<Chip
											color={getTripStatusColor(trip.status)}
											size="sm"
											variant="flat">
											{trip.status.replace("_", " ")}
										</Chip>
										<span className="text-xs text-default-500">
											{new Date(trip.requestTime).toLocaleTimeString()}
										</span>
									</div>

									<div className="space-y-2">
										<div className="flex items-start gap-2">
											<Icon icon="lucide:map-pin" className="text-success text-sm mt-0.5" />
											<div className="flex-1 min-w-0">
												<p className="text-xs text-default-500">Pickup</p>
												<p className="text-sm font-medium truncate">
													{trip.pickupAddress}
												</p>
											</div>
										</div>

										<div className="flex items-start gap-2">
											<Icon icon="lucide:flag" className="text-danger text-sm mt-0.5" />
											<div className="flex-1 min-w-0">
												<p className="text-xs text-default-500">Dropoff</p>
												<p className="text-sm font-medium truncate">
													{trip.dropoffAddress}
												</p>
											</div>
										</div>

										{trip.vehicleTrip && (
											<div className="flex items-center gap-2 pt-2 border-t border-divider">
												<Icon icon="lucide:user" className="text-default-400 text-sm" />
												<span className="text-sm">
													{trip.vehicleTrip.driver.fullName ||
														`${trip.vehicleTrip.driver.firstName} ${trip.vehicleTrip.driver.lastName}`}
												</span>
												<Icon icon="lucide:car" className="text-default-400 text-sm ml-auto" />
												<span className="text-sm">{trip.vehicleTrip.taxi.licensePlate}</span>
											</div>
										)}
									</div>

									<div className="flex items-center justify-between mt-3 pt-2 border-t border-divider">
										<span className="text-sm font-semibold text-success">
											R{Number(trip.fare).toFixed(2)}
										</span>
										<Button
											as={Link}
											href={`/dashboard/trips/${trip.id}`}
											size="sm"
											variant="light"
											color="primary"
											endContent={<Icon icon="lucide:arrow-right" />}>
											Details
										</Button>
									</div>
								</CardBody>
							</Card>
						))}
					</div>
				</div>

				{/* Map */}
				<div className="flex-1 relative">
					<APIProvider apiKey={apiKey}>
						<Map
							{...({ mapId } as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
							defaultCenter={mapCenter}
							defaultZoom={12}
							style={{ width: "100%", height: "100%" }}
							gestureHandling="auto"
							disableDefaultUI={false}>
							{/* Render markers for all active trips */}
							{activeTrips.map((trip) => (
								<div key={trip.id}>
									{/* Current Vehicle Location Marker (if available) */}
									{trip.currentLocation && (
										<AdvancedMarker
											position={{ lat: trip.currentLocation.lat, lng: trip.currentLocation.lng }}
											title={`Vehicle: ${trip.vehicleTrip?.taxi.licensePlate || "Unknown"}`}
											onClick={() => {
												setSelectedMarker(trip.id);
												setSelectedTrip(trip);
											}}>
											<div className="relative">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="#3b82f6"
													width="36"
													height="36"
													className="drop-shadow-lg"
													style={{
														transform: trip.currentLocation.heading
															? `rotate(${trip.currentLocation.heading}deg)`
															: undefined,
													}}>
													<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
												</svg>
												{selectedTrip?.id === trip.id && (
													<div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-ping" />
												)}
												{/* Speed indicator */}
												{trip.currentLocation.speed !== undefined && (
													<div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
														{Math.round(trip.currentLocation.speed)} km/h
													</div>
												)}
											</div>
										</AdvancedMarker>
									)}

									{/* Pickup Marker */}
									<AdvancedMarker
										position={{ lat: trip.pickupLat, lng: trip.pickupLng }}
										title={`Pickup: ${trip.pickupAddress}`}
										onClick={() => {
											setSelectedMarker(trip.id);
											setSelectedTrip(trip);
										}}>
										<div className="relative">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="#22c55e"
												width="28"
												height="28"
												className="drop-shadow-lg"
												style={{ opacity: trip.currentLocation ? 0.6 : 1 }}>
												<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
											</svg>
										</div>
									</AdvancedMarker>

									{/* Dropoff Marker */}
									<AdvancedMarker
										position={{ lat: trip.dropoffLat, lng: trip.dropoffLng }}
										title={`Dropoff: ${trip.dropoffAddress}`}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="#ef4444"
											width="28"
											height="28"
											className="drop-shadow-lg"
											style={{ opacity: trip.currentLocation ? 0.6 : 1 }}>
											<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
										</svg>
									</AdvancedMarker>

									{/* Info Window for selected trip */}
									{selectedMarker === trip.id && (
										<InfoWindow
											position={
												trip.currentLocation
													? { lat: trip.currentLocation.lat, lng: trip.currentLocation.lng }
													: { lat: trip.pickupLat, lng: trip.pickupLng }
											}
											onCloseClick={() => setSelectedMarker(null)}>
											<div className="p-2 min-w-[200px]">
												<p className="font-semibold mb-2">{trip.route.name}</p>
												<Chip
													color={getTripStatusColor(trip.status)}
													size="sm"
													variant="flat"
													className="mb-2">
													{trip.status.replace("_", " ")}
												</Chip>
												{trip.vehicleTrip && (
													<div className="text-sm space-y-1">
														<p>
															<strong>Driver:</strong>{" "}
															{trip.vehicleTrip.driver.fullName ||
																`${trip.vehicleTrip.driver.firstName} ${trip.vehicleTrip.driver.lastName}`}
														</p>
														<p>
															<strong>Vehicle:</strong> {trip.vehicleTrip.taxi.model}
														</p>
													</div>
												)}
												<Link href={`/dashboard/trips/${trip.id}`}>
													<Button
														size="sm"
														color="primary"
														className="w-full mt-3"
														endContent={<Icon icon="lucide:arrow-right" />}>
														View Details
													</Button>
												</Link>
											</div>
										</InfoWindow>
									)}
								</div>
							))}
						</Map>
					</APIProvider>

					{/* Map Legend */}
					<Card className="absolute bottom-4 right-4 shadow-lg">
						<CardBody className="p-3">
							<p className="text-sm font-semibold mb-2">Legend</p>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-primary" />
									<span className="text-xs">Vehicle (Live)</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-success" />
									<span className="text-xs">Pickup Location</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-danger" />
									<span className="text-xs">Dropoff Location</span>
								</div>
							</div>
						</CardBody>
					</Card>

					{/* WebSocket connection status */}
					<div className="absolute top-4 right-4">
						<Chip
							color={socketRef.current?.connected ? "success" : "warning"}
							variant="flat"
							startContent={
								<div className={`w-2 h-2 rounded-full ${socketRef.current?.connected ? "bg-success animate-pulse" : "bg-warning"}`} />
							}>
							{socketRef.current?.connected ? "Live Tracking Active" : "Connecting..."}
						</Chip>
					</div>
				</div>
			</div>
		</div>
	);
}
