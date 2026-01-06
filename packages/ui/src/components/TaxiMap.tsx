"use client";
import React, { useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

import TaxiCard from "./TaxiCard";

import { iTaxi } from "@/types";
import { getTaxiIcon } from "@/lib/helpers";

const containerStyle = {
	width: "100%",
	height: "100%",
	borderRadius: "1rem",
};

type TaxiMapProps = {
	taxis: (iTaxi & { lat: number; lng: number })[];
	center?: { lat: number; lng: number };
};

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

	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center h-full">
				<span>Loading map...</span>
			</div>
		);
	}

	return (
		<GoogleMap
			center={mapCenter}
			mapContainerStyle={containerStyle}
			options={{
				colorScheme: "dark",
				mapId: "6f784bfcbfd84df03172e7e4",
			}}
			zoom={13}>
			{taxis.map((taxi) => (
				<Marker
					key={taxi.id}
					icon={getTaxiIcon()}
					position={{ lat: taxi.lat, lng: taxi.lng }}
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
								<TaxiCard taxi={taxi} />
							</div>
						</InfoWindow>
					))}
		</GoogleMap>
	);
};

export default TaxiMap;
