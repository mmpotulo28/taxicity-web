"use client";

import React, { useEffect, useCallback, useState, useMemo, useRef } from "react";
import Map, { Marker, type MapRef, Source, Layer } from "react-map-gl/mapbox";

import { useRide } from "../context/RideContext";
import { useMap } from "../context/MapContext";

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
	passengerStops?: { lat: number; lng: number; type: 'pickup' | 'dropoff'; label?: string }[];
	taxiLocation?: { lat: number; lng: number };
	isDriver?: boolean;
}

const defaultCenter = {
	lat: -26.2041, // Johannesburg
	lng: 28.0473,
};

export const MapView: React.FC<MapViewProps> = ({
	showTaxis = true,
	centerOnRank = false,
	zIndex = -1,
	height = "200px",
	fullscreen = true,
	modalMap = false,
	selectionModeOverride = null,
	showRoute = false,
	customRoutePoints,
	passengerStops,
	taxiLocation,
	isDriver = false,
}) => {
	const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
	} = useMap();

	const mapInternalRef = useRef<MapRef | null>(null);
	const smoothTaxiLocation = useSmoothPosition(taxiLocation);
	const effectiveSelectionMode = selectionModeOverride || selectionMode;

	// Calculate route points for fallback
	const routePoints = useMemo(() => {
		if (customRoutePoints) return customRoutePoints;
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
	}, [selectedRoute, ranks, dropoffMarker, customRoutePoints]);

	// Convert routePoints to GeoJSON for rendering
	const routeGeoJSON = useMemo(() => {
		if (!routePoints || routePoints.length < 2) return null;
		return {
			type: "Feature" as const,
			properties: {},
			geometry: {
				type: "LineString" as const,
				coordinates: routePoints.map(p => [p.lng, p.lat])
			}
		};
	}, [routePoints]);

	// Set map ref
	const onMapLoad = useCallback((e: any) => {
		mapInternalRef.current = e.target;
		mapRef.current = e.target; // Expose to context
		setIsMapLoaded(true);
	}, [mapRef, setIsMapLoaded]);

	// Get user's current location
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
					// Fallback to default center if location access fails
				},
				{
					enableHighAccuracy: true,
					timeout: 5000,
					maximumAge: 0,
				}
			);
		}
	}, [setUserLocation, userLocation]);

	// Handle centering via flyTo
	useEffect(() => {
		if (!isMapLoaded || !mapInternalRef.current) return;

		let targetLoc: { lat: number, lng: number } | null = null;
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

		// Initial user location flyTo
		if (!targetLoc && userLocation && !modalMap) {
			// e.g. We might want to track user initially?
			// For now, let's not aggressively recenter on user unless needed
		}

		if (targetLoc) {
			mapInternalRef.current.flyTo({
				center: [targetLoc.lng, targetLoc.lat],
				zoom: targetZoom,
				duration: 1000
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
		modalMap,
		userLocation // careful adding userLocation here if we don't want constant recentering
	]);

	const onMapClick = useCallback((e: any) => {
		const { lngLat } = e;
		if (!modalMap || !contextHandleMapClick) return;

		// Mock the Google Maps event object structure expected by context
		const mockEvent = {
			latLng: {
				lat: () => lngLat.lat,
				lng: () => lngLat.lng
			}
		};
		contextHandleMapClick(mockEvent);

	}, [modalMap, contextHandleMapClick]);

	const mapContainerStyle = useMemo(() => (fullscreen
		? {
			width: "100%",
			height: "100%",
			zIndex: zIndex,
			position: "absolute" as const,
			top: 0,
			left: 0
		}
		: {
			width: "100%",
			height: height,
			position: "relative" as const,
		}), [fullscreen, zIndex, height]);

	if (!mapboxToken) {
		return (
			<div className="flex items-center justify-center bg-gray-100 p-4 text-center" style={{ height: height }}>
				<p className="text-red-500">
					Missing <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> environment variable.
				</p>
			</div>
		);
	}

	return (
		<div style={mapContainerStyle}>
			<Map
				initialViewState={{
					longitude: defaultCenter.lng,
					latitude: defaultCenter.lat,
					zoom: 14
				}}
				style={{ width: '100%', height: '100%' }}
				mapStyle="mapbox://styles/mmpotulo/cml57j7gg000901qxcy2yepbp"
				mapboxAccessToken={mapboxToken}
				onClick={onMapClick}
				onLoad={onMapLoad}
			>
				{/* Route Line */}
				{showRoute && routeGeoJSON && (
					<Source id="route" type="geojson" data={routeGeoJSON}>
						<Layer
							id="route-layer"
							type="line"
							paint={{
								'line-color': '#4f46e5',
								'line-width': 5,
								'line-opacity': 0.75
							}}
						/>
					</Source>
				)}

				{/* Route Point Markers (Popular Locations) */}
				{showRoute && !passengerStops && selectedRoute?.popularLocations?.map((loc, index) => (
					<Marker
						key={loc.id}
						latitude={loc.lat}
						longitude={loc.lng}
						anchor="center"
					>
						<div className="flex items-center justify-center w-5 h-5 bg-amber-500 rounded-full border-2 border-white text-white text-[10px] font-bold">
							{index + 1}
						</div>
					</Marker>
				))}

				{/* Passenger Stops */}
				{passengerStops?.map((stop, index) => (
					<Marker
						key={`stop-${index}`}
						latitude={stop.lat}
						longitude={stop.lng}
						anchor="center"
					>
						<div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-white text-white text-xs font-bold ${stop.type === 'pickup' ? 'bg-green-500' : 'bg-red-500'}`}>
							{index + 1}
						</div>
					</Marker>
				))}

				{/* User location marker */}
				{userLocation && (
					<Marker
						latitude={(isDriver && smoothTaxiLocation) ? smoothTaxiLocation.lat : userLocation.lat}
						longitude={(isDriver && smoothTaxiLocation) ? smoothTaxiLocation.lng : userLocation.lng}
						anchor="center"
					>
						{isDriver ? (
							<img src="/images/taxi-3d-transparent.png" width={40} height={40} alt="My Taxi" />
						) : (
							<div className="w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg" />
						)}
					</Marker>
				)}

				{/* Specific Taxi Location (for Passenger view) */}
				{smoothTaxiLocation && !isDriver && (
					<Marker
						latitude={smoothTaxiLocation.lat}
						longitude={smoothTaxiLocation.lng}
						anchor="center"
					>
						<img src="/images/taxi-3d-transparent.png" width={40} height={40} alt="Taxi" />
					</Marker>
				)}

				{/* Pickup marker */}
				{pickupMarker && (
					<Marker
						latitude={pickupMarker.lat}
						longitude={pickupMarker.lng}
						anchor="bottom"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#22c55e" width="32" height="32" className="drop-shadow-md">
							<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
						</svg>
					</Marker>
				)}

				{/* Dropoff marker */}
				{dropoffMarker && (
					<Marker
						latitude={dropoffMarker.lat}
						longitude={dropoffMarker.lng}
						anchor="bottom"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="32" height="32" className="drop-shadow-md">
							<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
						</svg>
					</Marker>
				)}

				{/* Taxi markers (other taxis) */}
				{showTaxis &&
					taxis
						.filter((taxi) => taxi.location)
						.filter((taxi) => !taxiLocation || (Math.abs(taxi.location!.lat - taxiLocation.lat) > 0.0001 || Math.abs(taxi.location!.lng - taxiLocation.lng) > 0.0001))
						.map((taxi) => (
							<Marker
								key={taxi.id}
								latitude={taxi.location!.lat}
								longitude={taxi.location!.lng}
								anchor="center"
							>
								<img src="/images/taxi-3d-transparent.png" width={40} height={40} alt="Taxi" title={`${taxi.driver} - ${taxi.model}`} />
							</Marker>
						))}

				{/* Rank markers */}
				{ranks.map((rank) => (
					<Marker
						key={rank.id}
						latitude={rank.coordinates.lat}
						longitude={rank.coordinates.lng}
						anchor="bottom"
					>
						<div title={rank.name} className="cursor-pointer">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="24" height="24" className="drop-shadow-md">
								<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
							</svg>
						</div>
					</Marker>
				))}
			</Map>
		</div>
	);
};

export default MapView;
