import React, { useEffect, useCallback, useState, useMemo } from "react";
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer, Polyline } from "@react-google-maps/api";

import { useRide } from "@/context/RideContext";
import { useMap } from "@/context/MapContext";
import { getTaxiIcon } from "@/lib/helpers";

interface MapViewProps {
	fullscreen?: boolean;
	showTaxis?: boolean;
	centerOnRank?: boolean;
	zIndex?: number;
	height?: string;
	modalMap?: boolean;
	selectionModeOverride?: "pickup" | "dropoff" | null;
	showRoute?: boolean;
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
}) => {
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
		libraries: ["places"],
	});

	const { taxis, selectedRoute, ranks } = useRide();
	const {
		mapRef,
		userLocation,
		setUserLocation,
		pickupMarker,
		dropoffMarker,
		handleMapClick,
		setIsMapLoaded,
		selectionMode,
	} = useMap();

	const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
	const [directionsError, setDirectionsError] = useState(false);

	const effectiveSelectionMode = selectionModeOverride || selectionMode;

	// Calculate route points for fallback
	const routePoints = useMemo(() => {
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
	}, [selectedRoute, ranks, dropoffMarker]);

	// Fetch directions when showRoute is true
	useEffect(() => {
		if (isLoaded && showRoute && routePoints) {
			const origin = routePoints[0];
			const destination = routePoints[routePoints.length - 1];
			const waypoints = routePoints.slice(1, -1).map((loc) => ({
				location: loc,
				stopover: true,
			}));

			const directionsService = new google.maps.DirectionsService();

			directionsService.route(
				{
					origin,
					destination,
					waypoints,
					travelMode: google.maps.TravelMode.DRIVING,
				},
				(result, status) => {
					if (status === google.maps.DirectionsStatus.OK) {
						setDirections(result);
						setDirectionsError(false);
					} else {
						console.error(`Directions request failed due to ${status}`);
						setDirectionsError(true);
					}
				},
			);
		}
	}, [isLoaded, showRoute, routePoints]);

	// Get user's current location
	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const location = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};

					setUserLocation(location);
				},
				() => {
					console.error("Error getting user location");
				},
			);
		}
	}, [setUserLocation]);

	// Calculate map center
	const calculateMapCenter = useCallback(() => {
		if (centerOnRank && selectedRoute) {
			const rank = ranks.find((r) => r.id === selectedRoute.rankId);

			if (rank) return rank.coordinates;
		}

		if (effectiveSelectionMode === "pickup" && pickupMarker) return pickupMarker;
		if (effectiveSelectionMode === "dropoff" && dropoffMarker) return dropoffMarker;
		if (userLocation) return userLocation;

		return defaultCenter;
	}, [
		centerOnRank,
		selectedRoute,
		ranks,
		pickupMarker,
		dropoffMarker,
		userLocation,
		effectiveSelectionMode,
	]);

	// Handle map load
	const handleMapLoad = useCallback(
		(map: google.maps.Map) => {
			mapRef.current = map as any;
			setIsMapLoaded(true);
		},
		[mapRef, setIsMapLoaded],
	);

	const mapContainerStyle = fullscreen
		? {
			position: "absolute" as const,
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			width: "100%",
			height: "100%",
			zIndex: zIndex,
		}
		: {
			width: "100%",
			height: height,
			position: "relative" as const,
		};

	// Render map
	const renderMap = useCallback(() => {
		const mapCenter = calculateMapCenter();

		return (
			<GoogleMap
				center={mapCenter}
				mapContainerStyle={mapContainerStyle}
				options={{
					disableDefaultUI: false,
					zoomControl: true,
					mapTypeControl: false,
					fullscreenControl: false,
					streetViewControl: false,
					clickableIcons: false,
					styles: [
						{
							featureType: "poi",
							elementType: "labels",
							stylers: [{ visibility: "off" }],
						},
					],
				}}
				zoom={14}
				onClick={modalMap ? handleMapClick : undefined}
				onLoad={handleMapLoad}>
				{/* Directions Renderer */}
				{directions && !directionsError && (
					<DirectionsRenderer
						directions={directions}
						options={{
							suppressMarkers: true, // We use our own markers
							polylineOptions: {
								strokeColor: "#4f46e5",
								strokeWeight: 5,
							},
						}}
					/>
				)}

				{/* Fallback Polyline if Directions API fails */}
				{directionsError && routePoints && (
					<Polyline
						path={routePoints}
						options={{
							strokeColor: "#4f46e5",
							strokeOpacity: 0.5,
							strokeWeight: 4,
							geodesic: true,
						}}
					/>
				)}

				{/* Route Stops (Popular Locations) */}
				{showRoute && selectedRoute?.popularLocations?.map((loc, index) => (
					<Marker
						key={loc.id}
						icon={{
							url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b" width="24" height="24"><circle cx="12" cy="12" r="8" stroke="white" stroke-width="2"/></svg>',
							scaledSize: new google.maps.Size(20, 20),
							anchor: new google.maps.Point(10, 10),
						}}
						position={{ lat: loc.lat, lng: loc.lng }}
						title={loc.name}
						label={{
							text: (index + 1).toString(),
							color: "white",
							fontSize: "10px",
							fontWeight: "bold"
						}}
					/>
				))}

				{/* User location marker */}
				{userLocation && (
					<Marker
						icon={{
							url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234f46e5" width="24" height="24"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/></svg>',
							scaledSize: new google.maps.Size(24, 24),
						}}
						position={userLocation}
					/>
				)}

				{/* Pickup marker */}
				{pickupMarker && (
					<Marker
						animation={google.maps.Animation.DROP}
						icon={{
							url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
							scaledSize: new google.maps.Size(32, 32),
							anchor: new google.maps.Point(16, 32),
						}}
						position={pickupMarker}
					/>
				)}

				{/* Dropoff marker */}
				{dropoffMarker && (
					<Marker
						animation={google.maps.Animation.DROP}
						icon={{
							url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
							scaledSize: new google.maps.Size(32, 32),
							anchor: new google.maps.Point(16, 32),
						}}
						position={dropoffMarker}
					/>
				)}

				{/* Taxi markers */}
				{showTaxis &&
					taxis
						.filter((taxi) => taxi.location)
						.map((taxi) => (
							<Marker
								key={taxi.id}
								icon={getTaxiIcon()}
								position={taxi.location!}
								title={`${taxi.driver} - ${taxi.model}`}
							/>
						))}

				{/* Rank markers */}
				{ranks.map((rank) => (
					<Marker
						key={rank.id}
						icon={{
							url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
							scaledSize: new google.maps.Size(24, 24),
						}}
						position={rank.coordinates}
						title={rank.name}
					/>
				))}
			</GoogleMap>
		);
	}, [
		calculateMapCenter,
		mapContainerStyle,
		handleMapClick,
		handleMapLoad,
		pickupMarker,
		dropoffMarker,
		ranks,
		showTaxis,
		taxis,
		userLocation,
		modalMap,
	]);

	if (loadError) return <div className="text-danger">Failed to load maps</div>;
	if (!isLoaded)
		return (
			<div className="h-full bg-default-100 flex items-center justify-center">
				Loading maps...
			</div>
		);

	return renderMap();
};

export default MapView;
