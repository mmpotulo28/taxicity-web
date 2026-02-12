"use client";

import React, { useEffect, useCallback, useState, useMemo } from "react";
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

import { useRide } from "../context/RideContext";
import { useMap as useMapContext } from "../context/MapContext";

// Polyline component for Google Maps
const Polyline = (props: google.maps.PolylineOptions) => {
	const map = useMap();
	const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

	useEffect(() => {
		if (!map) return;

		const p = new google.maps.Polyline(props);
		p.setMap(map);
		setPolyline(p);

		return () => {
			p.setMap(null);
		};
	}, [map]);

	useEffect(() => {
		if (polyline) {
			polyline.setOptions(props);
		}
	}, [polyline, props]);

	return null;
};

// Hook for smooth marker animation
const useSmoothPosition = (targetPosition: { lat: number; lng: number } | undefined | null, duration = 5000) => {
	const [currentPosition, setCurrentPosition] = useState(targetPosition);
	const positionRef = React.useRef(targetPosition);
	const requestRef = React.useRef<number | undefined>(undefined);
	const startTimeRef = React.useRef<number | undefined>(undefined);
	const startPositionRef = React.useRef(targetPosition);

	useEffect(() => {
		if (!targetPosition) return;

		if (!positionRef.current) {
			positionRef.current = targetPosition;
			setCurrentPosition(targetPosition);
			return;
		}

		if (targetPosition.lat === positionRef.current.lat && targetPosition.lng === positionRef.current.lng) {
			return;
		}

		startPositionRef.current = positionRef.current;
		startTimeRef.current = undefined;

		const animate = (time: number) => {
			if (!startTimeRef.current) startTimeRef.current = time;
			const progress = Math.min((time - startTimeRef.current) / duration, 1);

			if (startPositionRef.current) {
				const lat = startPositionRef.current.lat + (targetPosition.lat - startPositionRef.current.lat) * progress;
				const lng = startPositionRef.current.lng + (targetPosition.lng - startPositionRef.current.lng) * progress;
				const newPos = { lat, lng };
				positionRef.current = newPos;
				setCurrentPosition(newPos);
			}

			if (progress < 1) {
				requestRef.current = requestAnimationFrame(animate);
			}
		};

		requestRef.current = requestAnimationFrame(animate);

		return () => {
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		};
	}, [targetPosition, duration]);

	return currentPosition || targetPosition;
};

// Isolated component for animated markers to prevent parent re-renders
const SmoothMarker = ({
	targetPosition,
	children,
	...props
}: {
	targetPosition: { lat: number; lng: number } | undefined | null;
	children?: React.ReactNode;
} & Omit<React.ComponentProps<typeof AdvancedMarker>, "position">) => {
	const position = useSmoothPosition(targetPosition);

	if (!position) return null;

	return (
		<AdvancedMarker position={position} {...props}>
			{children}
		</AdvancedMarker>
	);
};

interface MapViewProps {
	fullscreen?: boolean;
	showTaxis?: boolean;
	centerOnRank?: boolean;
	zIndex?: number;
	height?: string;
	modalMap?: boolean;
	selectionModeOverride?: "pickup" | "dropoff" | null;
	showRoute?: boolean;
	customRoutePoints?: { lat: number; lng: number }[];
	routePolyline?: string; // New: encoded polyline string
	passengerStops?: { lat: number; lng: number; type: 'pickup' | 'dropoff'; label?: string }[];
	taxiLocation?: { lat: number; lng: number };
	isDriver?: boolean;
}

const defaultCenter = {
	lat: -26.2041, // Johannesburg
	lng: 28.0473,
};

// Internal component to access Map instance and render content
const MapContent: React.FC<MapViewProps> = ({
	showTaxis,
	centerOnRank,
	modalMap,
	selectionModeOverride,
	showRoute,
	customRoutePoints,
	// Removed: usage of useSmoothPosition directly here to prevent re-renders on every frame
	// const smoothTaxiLocation = useSmoothPosition(taxiLocation);

	passengerStops,
	taxiLocation,
	isDriver,
}) => {
	const map = useMap();
	const geometryLib = useMapsLibrary("geometry");
	const { taxis, selectedRoute, ranks } = useRide();
	const {
		mapRef,
		userLocation,
		setUserLocation,
		pickupMarker,
		dropoffMarker,
		handleMapClick: contextHandleMapClick,
		setIsMapLoaded,
		selectionMode,
		isMapLoaded,
	} = useMapContext();

	const smoothTaxiLocation = useSmoothPosition(taxiLocation);
	const effectiveSelectionMode = selectionModeOverride || selectionMode;

	// Calculate route points
	const routePoints = useMemo(() => {
		// Priority 1: Direct Polyline Prop (e.g. from Driver Console)
		if (routePolyline && geometryLib) {
			try {
				const path = geometryLib.encoding.decodePath(routePolyline);
				return path.map((p) => ({ lat: p.lat(), lng: p.lng() }));
			} catch (e) {
				console.error("Failed to decode routePolyline prop", e);
			}
		}

		// Priority 2: Selected Route from Context (User flow)
		if (selectedRoute?.polyline && geometryLib) {
			try {
				const path = geometryLib.encoding.decodePath(selectedRoute.polyline);
				return path.map((p) => ({ lat: p.lat(), lng: p.lng() }));
			} catch (e) {
				console.error("Failed to decode selectedRoute.polyline", e);
			}
		}

		// Priority 3: Custom Points Array
		if (customRoutePoints) return customRoutePoints;

		// Fallback: Line between rank and destination/dropoff
		if (!selectedRoute || ranks.length === 0) return null;

		const originRank = ranks.find((r) => r.id === selectedRoute.rankId);
		const destRank = ranks.find((r) => r.id === selectedRoute.destinationRankId);
		const origin = originRank?.coordinates;
		const destination = destRank?.coordinates || dropoffMarker;

		if (!origin || !destination) return null;

		const waypoints =
			selectedRoute.popularLocations?.map((loc) => ({
				lat: loc.lat,
				lng: loc.lng,
			})) || [];

		return [origin, ...waypoints, destination];
	}, [selectedRoute, routePolyline, ranks, dropoffMarker, customRoutePoints, geometryLib]);

	// Sync map reference
	useEffect(() => {
		if (map && mapRef) {
			mapRef.current = map;
			setIsMapLoaded(true);
		}
	}, [map, mapRef, setIsMapLoaded]);

	// Get user's active location
	useEffect(() => {
		if (navigator.geolocation && !userLocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const location = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};
					setUserLocation(location);
				},
				(error) => {
					console.warn("Error getting user location:", error.message);
				},
				{
					enableHighAccuracy: true,
					timeout: 5000,
					maximumAge: 0,
				}
			);
		}
	}, [setUserLocation, userLocation]);

	// Handle centering / FlyTo
	useEffect(() => {
		if (!isMapLoaded || !map) return;

		let targetLoc: { lat: number; lng: number } | null = null;
		let targetZoom = 14;

		if (centerOnRank && selectedRoute) {
			const rank = ranks.find((r) => r.id === selectedRoute.rankId);
			if (rank) {
				targetLoc = rank.coordinates;
				targetZoom = 15;
			}
		} else if (effectiveSelectionMode === "pickup" && pickupMarker) {
			targetLoc = pickupMarker;
			targetZoom = 16;
		} else if (effectiveSelectionMode === "dropoff" && dropoffMarker) {
			targetLoc = dropoffMarker;
			targetZoom = 16;
		}

		if (targetLoc) {
			(map as any).moveCamera({
				center: targetLoc,
				zoom: targetZoom,
			});
		}
	}, [
		centerOnRank,
		selectedRoute,
		ranks,
		pickupMarker,
		dropoffMarker,
		effectiveSelectionMode,
		isMapLoaded,
		map,
	]);

	const onMapClick = useCallback(
		(e: any) => {
			if (!modalMap || !contextHandleMapClick) return;
			// Google Maps event has detail with latLng
			const latLng = e.detail.latLng;
			if (latLng) {
				const mockEvent = {
					latLng: {
						lat: () => latLng.lat,
						lng: () => latLng.lng,
					},
				};
				contextHandleMapClick(mockEvent);
			}
		},
		[modalMap, contextHandleMapClick]
	);

	return (
		<>
			{/* Route Line */}
			{showRoute && routePoints && routePoints.length >= 2 && (
				<Polyline
					path={routePoints}
					strokeColor="#4f46e5"
					strokeWeight={5}
					strokeOpacity={0.75}
					clickable={false}
					geodesic={true}
				/>
			)}

			{/* Route Markers (Popular Locations) */}
			{showRoute &&
				!passengerStops &&
				selectedRoute?.popularLocations?.map((loc, index) => (
					<AdvancedMarker
						key={loc.id}
						position={{ lat: loc.lat, lng: loc.lng }}
					>
						<div className="flex items-center justify-center w-5 h-5 bg-amber-500 rounded-full border-2 border-white text-white text-[10px] font-bold">
							{index + 1}
						</div>
					</AdvancedMarker>
				))}
			{/* If Driver, we show the smooth Taxi location instead of raw GPS if available */}
			{isDriver ? (
				<SmoothMarker targetPosition={taxiLocation || userLocation}>
					<img
						src="/images/taxi-3d-transparent.png"
						width={40}
						height={40}
						alt="My Taxi"
					/>
				</SmoothMarker>
			) : (
				userLocation && (
					<AdvancedMarker position={userLocation}>
						<div className="w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg" />
					</AdvancedMarker>
				)
			)}

			{/* Specific Taxi Location (for Passenger view - tracking assigned driver) */}
			{taxiLocation && !isDriver && (
				<SmoothMarker targetPosition={taxiLocation}>
					<img
						src="/images/taxi-3d-transparent.png"
						width={40}
						height={40}
						alt="Taxi"
					/>
				</SmoothMarker>
			)}

			{/* Pickup marker */}
			{
				pickupMarker && (
					<AdvancedMarker position={pickupMarker}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="#22c55e"
							width="32"
							height="32"
							className="drop-shadow-md"
						>
							<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
						</svg>
					</AdvancedMarker>
				)
			}

			{/* Dropoff marker */}
			{
				dropoffMarker && (
					<AdvancedMarker position={dropoffMarker}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="#ef4444"
							width="32"
							height="32"
							className="drop-shadow-md"
						>
							<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
						</svg>
					</AdvancedMarker>
				)
			}

			{/* Passenger Stops (Driver View) */}
			{
				passengerStops?.map((stop, index) => (
					<AdvancedMarker
						key={`stop-${index}`}
						position={{ lat: stop.lat, lng: stop.lng }}
						title={stop.label}
					>
						<div className={`p-1.5 rounded-full border-2 border-white shadow-md ${stop.type === 'pickup' ? 'bg-green-500' : 'bg-blue-500'}`}>
							{stop.type === 'pickup' ? (
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
									<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
									<circle cx="12" cy="10" r="3" />
								</svg>
							) : (
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
									<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
									<circle cx="12" cy="10" r="3" />
								</svg>
							)}
						</div>
					</AdvancedMarker>
				))
			}

			{/* Taxi markers (other taxis) */}
			{
				showTaxis &&
				taxis
					.filter((taxi) => taxi.location)
					.filter(
						(taxi) =>
							!taxiLocation ||
							Math.abs(taxi.location!.lat - taxiLocation.lat) > 0.0001 ||
							Math.abs(taxi.location!.lng - taxiLocation.lng) > 0.0001
					)
					.map((taxi) => (
						<SmoothMarker
							key={taxi.id}
							targetPosition={{ lat: taxi.location!.lat, lng: taxi.location!.lng }}
							title={`${taxi.driver} - ${taxi.model}`}
						>
							<img
								src="/images/taxi-3d-transparent.png"
								width={40}
								height={40}
								alt="Taxi"
							/>
						</SmoothMarker>
					))
			}

			{/* Rank markers */}
			{
				ranks.map((rank) => (
					<AdvancedMarker
						key={rank.id}
						position={{ lat: rank.coordinates.lat, lng: rank.coordinates.lng }}
						title={rank.name}
						onClick={() => console.log("Rank clicked:", rank.name)}
					>
						<div className="cursor-pointer">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="#ef4444"
								width="24"
								height="24"
								className="drop-shadow-md"
							>
								<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
							</svg>
						</div>
					</AdvancedMarker>
				))
			}
		</>
	);
};

export const MapView: React.FC<MapViewProps> = (props) => {
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

	const mapContainerStyle = useMemo(
		() =>
			props.fullscreen
				? {
					width: "100%",
					height: "100%",
					zIndex: props.zIndex || -1,
					position: "absolute" as const,
					top: 0,
					left: 0,
				}
				: {
					width: "100%",
					height: props.height || "100%",
					position: "relative" as const,
				},
		[props.fullscreen, props.zIndex, props.height]
	);

	if (!apiKey) {
		return (
			<div
				className="flex items-center justify-center bg-gray-100 p-4 text-center"
				style={{ height: props.height || "200px" }}
			>
				<p className="text-red-500">
					Missing <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment
					variable.
				</p>
			</div>
		);
	}

	return (
		<div style={mapContainerStyle}>
			<APIProvider apiKey={apiKey}>
				<Map
					mapId={mapId}
					defaultCenter={defaultCenter}
					defaultZoom={14}
					style={{ width: "100%", height: "100%" }}
					gestureHandling={props.modalMap ? "cooperative" : "auto"}
					disableDefaultUI={false}
				>
					<MapContent {...props} />
				</Map>
			</APIProvider>
		</div>
	);
};

export default MapView;
