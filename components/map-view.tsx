import React, { useEffect, useCallback } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

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

	const effectiveSelectionMode = selectionModeOverride || selectionMode;

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
