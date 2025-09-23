"use client";
import React, { useState, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { iTaxi } from "@/types";
import TaxiCard from "./TaxiCard";

const containerStyle = {
	width: "100%",
	height: "100%",
	borderRadius: "1rem",
};

type TaxiMapProps = {
	taxis: (iTaxi & { lat: number; lng: number })[];
	center?: { lat: number; lng: number };
};

const darkMapStyle = [
	{ elementType: "geometry", stylers: [{ color: "#212121" }] },
	{ elementType: "labels.icon", stylers: [{ visibility: "off" }] },
	{ elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
	{ elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
	{ featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
	{ featureType: "poi", elementType: "geometry", stylers: [{ color: "#282828" }] },
	{ featureType: "road", elementType: "geometry", stylers: [{ color: "#383838" }] },
	{ featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212121" }] },
	{ featureType: "water", elementType: "geometry", stylers: [{ color: "#181818" }] },
	// ...add more for full dark mode...
];

const TaxiMap: React.FC<TaxiMapProps> = ({ taxis, center }) => {
	const [activeTaxiId, setActiveTaxiId] = useState<string | null>(null);

	const mapCenter =
		center ||
		(taxis.length > 0
			? { lat: taxis[0].lat, lng: taxis[0].lng }
			: { lat: -26.2041, lng: 28.0473 }); // Default to Johannesburg

	const { isLoaded } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
	});

	const getTaxiIcon = useCallback(() => {
		if (typeof window !== "undefined" && window.google && window.google.maps) {
			return {
				url: "/images/taxi-3d-transparent.png",
				scaledSize: new window.google.maps.Size(80, 80),
			};
		}
		return undefined;
	}, []);

	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center h-full">
				<span>Loading map...</span>
			</div>
		);
	}

	return (
		<GoogleMap
			mapContainerStyle={containerStyle}
			center={mapCenter}
			zoom={13}
			options={{
				colorScheme: "dark",
				mapId: "6f784bfcbfd84df03172e7e4",
			}}>
			{taxis.map((taxi) => (
				<Marker
					key={taxi.id}
					position={{ lat: taxi.lat, lng: taxi.lng }}
					icon={getTaxiIcon()}
					onClick={() => setActiveTaxiId(taxi.id)}
				/>
			))}
			{activeTaxiId &&
				taxis
					.filter((taxi) => taxi.id === activeTaxiId)
					.map((taxi) => (
						<InfoWindow
							key={taxi.id}
							position={{ lat: taxi.lat, lng: taxi.lng }}
							onCloseClick={() => setActiveTaxiId(null)}>
							<div style={{ minWidth: 260, maxWidth: 320 }}>
								<TaxiCard taxi={taxi} showSelect={false} />
							</div>
						</InfoWindow>
					))}
		</GoogleMap>
	);
};

export default TaxiMap;
