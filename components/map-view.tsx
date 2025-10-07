import React, { useEffect, useCallback } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

import { useRide } from "@/context/RideContext";
import { useMap } from "@/context/MapContext";

interface MapViewProps {
	fullscreen?: boolean;
	showTaxis?: boolean;
	centerOnRank?: boolean;
	zIndex?: number;
}

const mapContainerStyle = {
	position: "absolute" as const,
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	width: "100%",
	height: "100%",
};

const defaultCenter = {
	lat: -26.2041, // Johannesburg
	lng: 28.0473,
};

export const MapView: React.FC<MapViewProps> = ({
	showTaxis = true,
	centerOnRank = false,
	zIndex = -1,
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

		if (pickupMarker) return pickupMarker;
		if (userLocation) return userLocation;
		return defaultCenter;
	}, [centerOnRank, selectedRoute, ranks, pickupMarker, userLocation]);

	// Handle map load
	const handleMapLoad = useCallback(
		(map: google.maps.Map) => {
			// Fix: Correctly type the map reference
			mapRef.current = map as any;
			setIsMapLoaded(true);
		},
		[mapRef, setIsMapLoaded],
	);

	// Render map
	const renderMap = useCallback(() => {
		const mapCenter = calculateMapCenter();

		return (
			<GoogleMap
				mapContainerStyle={{
					...mapContainerStyle,
					zIndex: zIndex,
				}}
				zoom={14}
				center={mapCenter}
				options={{
					disableDefaultUI: false,
					zoomControl: true,
					mapTypeControl: false,
					fullscreenControl: false,
					streetViewControl: false,
					styles: [
						{
							featureType: "poi",
							elementType: "labels",
							stylers: [{ visibility: "off" }],
						},
					],
				}}
				onClick={handleMapClick}
				onLoad={handleMapLoad}>
				{/* User location marker */}
				{userLocation && (
					<Marker
						position={userLocation}
						icon={{
							url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234f46e5" width="24" height="24"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/></svg>',
							scaledSize: new google.maps.Size(24, 24),
						}}
					/>
				)}

				{/* Pickup marker */}
				{pickupMarker && (
					<Marker
						position={pickupMarker}
						icon={{
							url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
							scaledSize: new google.maps.Size(32, 32),
							anchor: new google.maps.Point(16, 32),
						}}
						animation={google.maps.Animation.DROP}
					/>
				)}

				{/* Dropoff marker */}
				{dropoffMarker && (
					<Marker
						position={dropoffMarker}
						icon={{
							url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
							scaledSize: new google.maps.Size(32, 32),
							anchor: new google.maps.Point(16, 32),
						}}
						animation={google.maps.Animation.DROP}
					/>
				)}

				{/* Taxi markers */}
				{showTaxis &&
					taxis
						.filter((taxi) => taxi.location)
						.map((taxi) => (
							<Marker
								key={taxi.id}
								position={taxi.location!}
								icon={{
									url:
										taxi.status === "available"
											? 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e" width="24" height="24"><path d="M5 4h14c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v10h14V6H5zm2 1h10v2H7V7zm0 4h3v5H7v-5zm5 0h5v5h-5v-5z"/></svg>'
											: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b" width="24" height="24"><path d="M5 4h14c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v10h14V6H5zm2 1h10v2H7V7zm0 4h3v5H7v-5zm5 0h5v5h-5v-5z"/></svg>',
									scaledSize: new google.maps.Size(24, 24),
								}}
								title={`${taxi.driver} - ${taxi.model}`}
							/>
						))}

				{/* Rank markers */}
				{ranks.map((rank) => (
					<Marker
						key={rank.id}
						position={rank.coordinates}
						icon={{
							url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
							scaledSize: new google.maps.Size(24, 24),
						}}
						title={rank.name}
					/>
				))}

				{/* Selection Mode Indicator */}
				{selectionMode && (
					<div
						style={{
							position: "absolute",
							bottom: "20px",
							left: "50%",
							transform: "translateX(-50%)",
							backgroundColor: selectionMode === "pickup" ? "#22c55e" : "#ef4444",
							color: "white",
							padding: "8px 16px",
							borderRadius: "20px",
							fontWeight: "bold",
							boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
						}}>
						Tap to select {selectionMode === "pickup" ? "pickup" : "drop-off"} location
					</div>
				)}
			</GoogleMap>
		);
	}, [
		calculateMapCenter,
		handleMapClick,
		handleMapLoad,
		pickupMarker,
		dropoffMarker,
		ranks,
		selectionMode,
		showTaxis,
		taxis,
		userLocation,
		zIndex,
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
