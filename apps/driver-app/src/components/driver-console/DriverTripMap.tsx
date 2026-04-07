import { View, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import type { DriverMapStop, MapCoordinate } from "../../modules/driver-console/useDriverConsole";

export function DriverTripMap({
	routeCoordinates,
	mapStops,
	currentLocation,
	nextStopDistanceMeters,
}: Readonly<{
	routeCoordinates: MapCoordinate[];
	mapStops: DriverMapStop[];
	currentLocation: { lat: number; lng: number; heading?: number; speed?: number } | null;
	nextStopDistanceMeters: number | null;
}>) {
	const getStopColor = (type: DriverMapStop["type"]) => {
		if (type === "pickup") {
			return "#10b981";
		}
		if (type === "dropoff") {
			return "#ef4444";
		}
		return "#8b5cf6";
	};

	const fallbackCenter = routeCoordinates[0] ?? mapStops[0]?.coordinate ?? (currentLocation ? { latitude: currentLocation.lat, longitude: currentLocation.lng } : { latitude: -26.2041, longitude: 28.0473 });

	return (
		<View className='rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<MapView
				style={{ height: 450, width: "100%" }}
				initialRegion={{
					latitude: fallbackCenter.latitude,
					longitude: fallbackCenter.longitude,
					latitudeDelta: 0.06,
					longitudeDelta: 0.06,
				}}>
				{routeCoordinates.length > 1 ? <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor='#fbbf24' /> : null}

				{mapStops.map((stop, idx) => (
					<Marker key={stop.id} coordinate={stop.coordinate} title={`${stop.type === "pickup" ? "🔴 Pickup" : "🟢 Dropoff"}: ${stop.label}`} pinColor={getStopColor(stop.type)} />
				))}

				{currentLocation ? <Marker coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }} title='🚕 Driver Location' description={nextStopDistanceMeters ? `${Math.round(nextStopDistanceMeters)}m away` : undefined} pinColor='#3b82f6' /> : null}
			</MapView>

			<View className='absolute bottom-0 left-0 right-0 bg-transparent p-3'>
				<View className='flex-row justify-between items-end'>
					<View className='bg-slate-900/80 p-2 rounded-xl'>
						<Text className='text-emerald-400 text-xs font-bold uppercase tracking-wider'>Route Status</Text>
						<Text className='text-white font-bold text-lg'>{mapStops.length} Stops</Text>
						<Text className='text-slate-300 text-sm'>{currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : "Acquiring GPS..."}</Text>
					</View>
					{nextStopDistanceMeters ? (
						<View className='bg-amber-500 px-3 py-2 rounded-full items-center shadow-md'>
							<Text className='text-white font-bold text-sm'>📍 {Math.round(nextStopDistanceMeters)}m</Text>
						</View>
					) : null}
				</View>
			</View>
		</View>
	);
}
