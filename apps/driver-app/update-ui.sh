#!/bin/bash

cat << 'EOF' > apps/driver-app/src/components/driver-console/DriverTripMap.tsx
import { View, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
				{routeCoordinates.length > 1 ? (
					<Polyline
						coordinates={routeCoordinates}
						strokeWidth={5}
						strokeColor='#fbbf24'
					/>
				) : null}

				{mapStops.map((stop, idx) => (
					<Marker
						key={stop.id}
						coordinate={stop.coordinate}
						title={`${stop.type === "pickup" ? "🔴 Pickup" : "🟢 Dropoff"}: ${stop.label}`}
						pinColor={getStopColor(stop.type)}
					/>
				))}

				{currentLocation ? (
					<Marker
						coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }}
						title='🚕 Driver Location'
						description={nextStopDistanceMeters ? `${Math.round(nextStopDistanceMeters)}m away` : undefined}
						pinColor='#3b82f6'
					/>
				) : null}
			</MapView>

			<View className='absolute bottom-0 left-0 right-0 bg-transparent p-3'>
				<View className='flex-row justify-between items-end'>
					<View className="bg-slate-900/80 p-2 rounded-xl">
						<Text className='text-emerald-400 text-xs font-bold uppercase tracking-wider'>Route Status</Text>
						<Text className='text-white font-bold text-lg'>{mapStops.length} Stops</Text>
						<Text className='text-slate-300 text-sm'>
							{currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : "Acquiring GPS..."}
						</Text>
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
EOF

cat << 'EOF' > apps/driver-app/src/components/driver-console/ModeSelector.tsx
import { Pressable, Text, View } from "react-native";

export function ModeSelector({ mode, onChange }: Readonly<{ mode: "roaming" | "rank"; onChange: (mode: "roaming" | "rank") => void }>) {
	return (
		<View className='flex-row bg-slate-100 rounded-2xl p-2 gap-2 shadow-sm border border-slate-200'>
			<Pressable
				onPress={() => onChange("roaming")}
				className={`flex-1 py-3 rounded-xl items-center justify-center transition-all ${
					mode === "roaming"
						? "bg-amber-400 shadow-md"
						: "bg-transparent"
				}`}
			>
				<View className='flex-row items-center justify-center gap-2'>
					<Text className={`text-base font-bold ${mode === "roaming" ? "text-amber-900" : "text-slate-600"}`}>
						🌍 Roaming
					</Text>
				</View>
			</Pressable>
			<Pressable
				onPress={() => onChange("rank")}
				className={`flex-1 py-3 rounded-xl items-center justify-center transition-all ${
					mode === "rank"
						? "bg-emerald-400 shadow-md"
						: "bg-transparent"
				}`}
			>
				<View className='flex-row items-center justify-center gap-2'>
					<Text className={`text-base font-bold ${mode === "rank" ? "text-emerald-900" : "text-slate-600"}`}>
						📍 Rank Queue
					</Text>
				</View>
			</Pressable>
		</View>
	);
}
EOF

cat << 'EOF' > apps/driver-app/src/components/driver-console/VehiclePicker.tsx
import { Pressable, ScrollView, Text, View } from "react-native";
import type { DriverProfile } from "../../modules/driver-console/useDriverConsole";

export function VehiclePicker({
	taxis,
	selectedTaxiId,
	onSelect,
}: Readonly<{
	taxis: DriverProfile["taxis"];
	selectedTaxiId: string;
	onSelect: (id: string) => void;
}>) {
	return (
		<View className='rounded-3xl bg-white border-2 border-slate-200 p-5 gap-3 shadow-md'>
			<View className='flex-row items-center gap-2'>
				<Text className='text-2xl'>🚕</Text>
				<Text className='text-xl font-bold text-slate-900'>Select Your Taxi</Text>
			</View>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName='gap-2'>
				{taxis.map((taxi) => {
					const active = selectedTaxiId === taxi.id;
					return (
						<Pressable
							key={taxi.id}
							onPress={() => onSelect(taxi.id)}
							className={`px-4 py-3 rounded-2xl border-2 shadow-sm transition-all ${
								active
									? "bg-amber-400 border-amber-500"
									: "bg-slate-50 border-slate-300"
							}`}
						>
							<Text className={`font-bold text-base ${active ? "text-amber-900" : "text-slate-700"}`}>
								🔷 {taxi.licensePlate}
							</Text>
							<Text className={`text-xs font-semibold mt-1 flex-1 ${active ? "text-amber-800" : "text-slate-500"}`}>
								{taxi.make} {taxi.model}
							</Text>
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
}
EOF

cat << 'EOF' > apps/driver-app/src/components/driver-console/RoamingModePanel.tsx
import { Pressable, ScrollView, Text, View } from "react-native";

export function RoamingModePanel({
	routes,
	selectedRouteId,
	busy,
	onSelectRoute,
	onStart,
}: Readonly<{
	routes: { id: string; name: string }[];
	selectedRouteId: string;
	busy: boolean;
	onSelectRoute: (id: string) => void;
	onStart: () => void;
}>) {
	return (
		<View className='gap-4 mt-2'>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName='gap-2'>
				{routes.map((route) => {
					const active = selectedRouteId === route.id;
					return (
						<Pressable
							key={route.id}
							onPress={() => onSelectRoute(route.id)}
							className={`px-4 py-3 rounded-2xl border-2 shadow-sm transition-all ${
								active
									? "bg-amber-400 border-amber-500"
									: "bg-slate-50 border-slate-300"
							}`}
						>
							<Text className={`font-bold text-base ${active ? "text-amber-900" : "text-slate-700"}`}>
								🚏 {route.name}
							</Text>
						</Pressable>
					);
				})}
			</ScrollView>
			<Pressable
				onPress={onStart}
				disabled={!selectedRouteId || busy}
				className={`rounded-2xl py-4 items-center justify-center border-b-4 transition-all shadow-md mt-2 ${
					!selectedRouteId || busy
						? "bg-slate-300 border-slate-400"
						: "bg-emerald-500 border-emerald-700"
				}`}
			>
				<Text className={`font-bold text-lg ${!selectedRouteId || busy ? "text-slate-500" : "text-white"}`}>
					{busy ? "🔄 Starting..." : "✨ Go Online"}
				</Text>
			</Pressable>
		</View>
	);
}
EOF

cat << 'EOF' > apps/driver-app/src/components/driver-console/RankModePanel.tsx
import { Pressable, ScrollView, Text, View } from "react-native";
import { QueueStatusCard } from "./QueueStatusCard";
import type { QueueStatus, RankOption } from "./types";

export function RankModePanel({
	ranks,
	selectedRankId,
	queueStatus,
	busy,
	onSelectRank,
	onJoin,
	onLeave,
}: Readonly<{
	ranks: RankOption[];
	selectedRankId: string;
	queueStatus: QueueStatus;
	busy: boolean;
	onSelectRank: (id: string) => void;
	onJoin: () => void;
	onLeave: () => void;
}>) {
	if (queueStatus?.inQueue) {
		return <QueueStatusCard queueStatus={queueStatus} onLeave={onLeave} />;
	}

	return (
		<View className='gap-4 mt-2'>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName='gap-2'>
				{ranks.map((rank) => {
					const active = selectedRankId === rank.id;
					return (
						<Pressable
							key={rank.id}
							onPress={() => onSelectRank(rank.id)}
							className={`px-4 py-3 rounded-2xl border-2 shadow-sm transition-all ${
								active
									? "bg-amber-400 border-amber-500"
									: "bg-slate-50 border-slate-300"
							}`}
						>
							<Text className={`font-bold text-lg ${active ? "text-amber-900" : "text-slate-700"}`}>
								📌 {rank.name}
							</Text>
							<Text className={`text-xs font-semibold mt-1 flex-1 ${active ? "text-amber-800" : "text-slate-500"}`}>
								{rank.address}
							</Text>
						</Pressable>
					);
				})}
			</ScrollView>
			<Pressable
				onPress={onJoin}
				disabled={!selectedRankId || busy}
				className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 border-b-4 transition-all shadow-md mt-2 ${
					!selectedRankId || busy
						? "bg-slate-300 border-slate-400"
						: "bg-emerald-500 border-emerald-700"
				}`}
			>
				<Text className={`font-bold text-lg ${!selectedRankId || busy ? "text-slate-500" : "text-white"}`}>
					{busy ? "🔄 Joining..." : "✨ Join Queue"}
				</Text>
			</Pressable>
		</View>
	);
}
EOF

cat << 'EOF' > apps/driver-app/src/components/driver-console/QueueStatusCard.tsx
import { Pressable, Text, View } from "react-native";
import type { QueueStatus } from "./types";

export function QueueStatusCard({ queueStatus, onLeave }: Readonly<{ queueStatus: Exclude<QueueStatus, null>; onLeave: () => void }>) {
	if (!queueStatus.rank) {
		return null;
	}

	return (
		<View className='rounded-3xl bg-emerald-50 border-2 border-emerald-300 p-5 mt-3 gap-4 shadow-sm'>
			<View className='flex-row items-center gap-2'>
				<Text className='text-3xl'>✅</Text>
				<Text className='text-emerald-800 font-bold text-xl flex-1'>In Queue: {queueStatus.rank.name}</Text>
			</View>
			<View className='bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm'>
				<View className='flex-row justify-between items-center mb-3'>
					<Text className='text-emerald-700 font-semibold text-base'>Position</Text>
					<Text className='text-emerald-900 font-black text-2xl'>
						{queueStatus.position ?? "-"} / {queueStatus.queueLength ?? "-"}
					</Text>
				</View>
				<View className='w-full bg-emerald-100 rounded-full h-3'>
					<View
						className='bg-emerald-500 h-3 rounded-full'
						style={{
							width: `${
								queueStatus.queueLength && queueStatus.position
									? (queueStatus.position / queueStatus.queueLength) * 100
									: 0
							}%`
						}}
					/>
				</View>
			</View>
			<Pressable
				onPress={onLeave}
				className='rounded-2xl border-2 border-emerald-600 bg-white py-3 items-center justify-center shadow-sm mt-1'
			>
				<Text className='font-bold text-emerald-700 text-lg'>👋 Leave Queue</Text>
			</Pressable>
		</View>
	);
}
EOF

cat << 'EOF' > apps/driver-app/src/components/driver-console/PassengerCard.tsx
import { Pressable, Text, View } from "react-native";
import type { RideStatusPayload } from "@taxiciti/utils";
import type { TripRequest } from "../../modules/driver-console/useDriverConsole";
import { getNextStatus } from "../../lib/driverConsoleUtils";

export function PassengerCard({ passenger, onAdvance }: Readonly<{ passenger: TripRequest; onAdvance: (id: string, status: RideStatusPayload["status"]) => void }>) {
	const next = getNextStatus(passenger.status);

	const statusEmoji: Record<string, string> = {
		"ACCEPTED": "✅",
		"ARRIVED_AT_PICKUP": "📍",
		"IN_PROGRESS": "🚕",
		"COMPLETED": "🏁",
	};

    // Convert status to readable text
    const displayStatus = passenger.status.replace(/_/g, ' ');

	return (
		<View className='rounded-3xl bg-amber-50 border border-amber-200 p-4 gap-3 shadow-sm'>
			<View className='flex-row items-center justify-between'>
				<View className='flex-row items-center gap-2 flex-1'>
					<Text className='text-2xl'>👤</Text>
					<Text className='font-bold text-slate-900 text-lg flex-1' numberOfLines={1}>{passenger.user?.firstName ?? "Passenger"}</Text>
				</View>
				<View className='bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200'>
					<Text className='text-amber-800 font-bold text-xs'>{statusEmoji[passenger.status] || "⚙️"} {displayStatus}</Text>
				</View>
			</View>
			<View className='bg-white rounded-2xl p-3 gap-3 border border-amber-100 shadow-sm'>
				<View className='flex-row gap-2 items-start'>
					<Text className='text-lg mt-0.5'>📍</Text>
					<View className='flex-1'>
						<Text className='text-slate-500 text-[10px] font-bold uppercase tracking-widest'>Pickup</Text>
						<Text className='text-slate-800 font-semibold text-sm'>{passenger.pickupAddress}</Text>
					</View>
				</View>
				<View className='flex-row gap-2 items-start'>
					<Text className='text-lg mt-0.5'>🏁</Text>
					<View className='flex-1'>
						<Text className='text-slate-500 text-[10px] font-bold uppercase tracking-widest'>Dropoff</Text>
						<Text className='text-slate-800 font-semibold text-sm'>{passenger.dropoffAddress}</Text>
					</View>
				</View>
			</View>
			{next ? (
				<Pressable
					onPress={() => onAdvance(passenger.id, next)}
					className='rounded-2xl bg-emerald-500 py-3.5 items-center justify-center border-b-4 border-emerald-700 shadow-sm mt-1'
				>
					<Text className='font-bold text-white text-base'>➡️ Mark as {next.replace(/_/g, ' ')}</Text>
				</Pressable>
			) : null}
		</View>
	);
}
EOF

cat << 'EOF' > apps/driver-app/src/components/driver-console/RequestCard.tsx
import { Pressable, Text, View } from "react-native";
import type { TripRequest } from "../../modules/driver-console/useDriverConsole";
import { formatCurrency } from "../../lib/driverConsoleUtils";

export function RequestCard({ request, onAccept, onDecline }: Readonly<{ request: TripRequest; onAccept: (id: string) => void; onDecline: (id: string) => void }>) {
	return (
		<View className='rounded-3xl bg-blue-50 border border-blue-200 p-4 gap-3 shadow-sm'>
			<View className='flex-row items-center justify-between'>
				<View className='flex-row items-center gap-2 flex-1'>
					<Text className='text-2xl'>👤</Text>
					<Text className='font-bold text-slate-900 text-lg flex-1' numberOfLines={1}>{request.user?.firstName ?? "Passenger"}</Text>
				</View>
				<View className='bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200'>
					<Text className='font-bold text-emerald-800 text-sm'>💰 {formatCurrency(request.fare)}</Text>
				</View>
			</View>
			<View className='bg-white rounded-2xl p-3 gap-3 border border-blue-100 shadow-sm'>
				<View className='flex-row gap-2 items-start'>
					<Text className='text-lg mt-0.5'>📍</Text>
					<View className='flex-1'>
						<Text className='text-slate-500 text-[10px] font-bold uppercase tracking-widest'>Pickup</Text>
						<Text className='text-slate-800 font-semibold text-sm'>{request.pickupAddress}</Text>
					</View>
				</View>
				<View className='flex-row gap-2 items-start'>
					<Text className='text-lg mt-0.5'>🏁</Text>
					<View className='flex-1'>
						<Text className='text-slate-500 text-[10px] font-bold uppercase tracking-widest'>Dropoff</Text>
						<Text className='text-slate-800 font-semibold text-sm'>{request.dropoffAddress}</Text>
					</View>
				</View>
			</View>
			<View className='flex-row gap-3 mt-1'>
				<Pressable
					onPress={() => onAccept(request.id)}
					className='flex-1 rounded-2xl bg-emerald-500 py-3.5 items-center justify-center border-b-4 border-emerald-700 shadow-sm'
				>
					<Text className='font-bold text-white text-base'>✅ Accept</Text>
				</Pressable>
				<Pressable
					onPress={() => onDecline(request.id)}
					className='flex-1 rounded-2xl bg-red-100 border-2 border-red-300 py-3.5 items-center justify-center shadow-sm'
				>
					<Text className='font-bold text-red-600 text-base'>❌ Decline</Text>
				</Pressable>
			</View>
		</View>
	);
}
EOF

cat << 'EOF' > apps/driver-app/src/components/driver-console/StartShiftSection.tsx
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ModeSelector } from "./ModeSelector";
import { VehiclePicker } from "./VehiclePicker";
import { RoamingModePanel } from "./RoamingModePanel";
import { RankModePanel } from "./RankModePanel";
import type { DriverProfile } from "../../modules/driver-console/useDriverConsole";
import type { RankOption, QueueStatus } from "./types";

export function StartShiftSection({
	driver,
	ranks,
	queueStatus,
	busy,
	onStartShift,
	onJoinQueue,
	onLeaveQueue,
}: Readonly<{
	driver: DriverProfile;
	ranks: RankOption[];
	queueStatus: QueueStatus;
	busy: boolean;
	onStartShift: (taxiId: string, routeId: string) => Promise<void>;
	onJoinQueue: (rankId: string, taxiId: string) => Promise<void>;
	onLeaveQueue: () => Promise<void>;
}>) {
	const [selectedTaxiId, setSelectedTaxiId] = useState("");
	const [selectedRouteId, setSelectedRouteId] = useState("");
	const [selectedRankId, setSelectedRankId] = useState("");
	const [mode, setMode] = useState<"roaming" | "rank">("roaming");

	const selectedTaxi = useMemo(() => driver.taxis.find((taxi) => taxi.id === selectedTaxiId), [driver.taxis, selectedTaxiId]);
	const routes = selectedTaxi?.routes?.map((entry) => entry.route) ?? [];

	return (
		<ScrollView className='flex-1 bg-slate-50' contentContainerClassName='p-4 pb-28 gap-5'>
			{/* Header Card */}
			<View className='rounded-3xl bg-amber-400 p-6 gap-1 shadow-md border-b-4 border-amber-600'>
				<Text className='text-amber-900 text-[10px] uppercase font-black tracking-widest mb-1'>Driver Console</Text>
				<Text className='text-slate-900 text-3xl font-black'>Ready to Earn,</Text>
				<Text className='text-slate-900 text-2xl font-bold bg-amber-500/20 self-start px-2 py-1 rounded-lg'>{driver.firstName}! 💪</Text>
				<Text className='text-amber-900 text-sm font-medium mt-2'>Select a vehicle and route to begin your shift</Text>
			</View>

			{/* Vehicle Picker */}
			<VehiclePicker taxis={driver.taxis} selectedTaxiId={selectedTaxiId} onSelect={setSelectedTaxiId} />

			{/* Mode & Route Selection */}
			{selectedTaxiId ? (
				<>
					<View className='rounded-3xl bg-white border border-slate-200 p-5 gap-4 shadow-sm'>
						<View className='flex-row items-center gap-2 mb-1'>
							<Text className='text-2xl'>⚙️</Text>
							<Text className='text-xl font-bold text-slate-900'>Choose Your Mode</Text>
						</View>
						<ModeSelector mode={mode} onChange={setMode} />
					</View>

					{/* Roaming or Rank Panel */}
					<View className='rounded-3xl bg-white border border-slate-200 p-5 gap-4 shadow-sm'>
						{mode === "roaming" ? (
							<>
								<View className='flex-row items-center gap-2 mb-1'>
									<Text className='text-2xl'>🌍</Text>
									<Text className='text-xl font-bold text-slate-900'>Select Route</Text>
								</View>
								<RoamingModePanel
									routes={routes}
									selectedRouteId={selectedRouteId}
									busy={busy}
									onSelectRoute={setSelectedRouteId}
									onStart={() => {
										onStartShift(selectedTaxiId, selectedRouteId);
									}}
								/>
							</>
						) : (
							<>
								<View className='flex-row items-center gap-2 mb-1'>
									<Text className='text-2xl'>📍</Text>
									<Text className='text-xl font-bold text-slate-900'>Select Rank</Text>
								</View>
								<RankModePanel
									ranks={ranks}
									selectedRankId={selectedRankId}
									queueStatus={queueStatus}
									busy={busy}
									onSelectRank={setSelectedRankId}
									onJoin={() => {
										onJoinQueue(selectedRankId, selectedTaxiId);
									}}
									onLeave={() => {
										onLeaveQueue();
									}}
								/>
							</>
						)}
					</View>
				</>
			) : null}

			{/* Info Card */}
			<View className='rounded-3xl bg-blue-50 border border-blue-200 p-5 gap-3 mt-2 shadow-sm'>
				<Text className='text-blue-900 font-black text-base uppercase tracking-wider'>💡 Quick Tips</Text>
				<Text className='text-blue-800 text-sm font-medium'>🌍 Roaming: Drive around freely and accept bookings anywhere on route.</Text>
				<Text className='text-blue-800 text-sm font-medium'>📍 Rank: Join a physical queue at a specific taxi rank location.</Text>
			</View>
		</ScrollView>
	);
}
EOF

cat << 'EOF' > apps/driver-app/src/components/driver-console/ActiveShiftSection.tsx
import { Pressable, ScrollView, Text, View } from "react-native";
import { DriverTripMap } from "./DriverTripMap";
import { RequestCard } from "./RequestCard";
import { PassengerCard } from "./PassengerCard";
import type { RideStatusPayload } from "@taxiciti/utils";
import type { DriverMapStop, MapCoordinate, TripRequest, VehicleTrip } from "../../modules/driver-console/useDriverConsole";

export function ActiveShiftSection({
	trip,
	incomingRequests,
	sortedPassengers,
	currentLocation,
	mapRouteCoordinates,
	mapStops,
	nextStopDistanceMeters,
	onAccept,
	onDecline,
	onAdvance,
	onUpdateWalkIn,
	onEndShift,
}: Readonly<{
	trip: VehicleTrip;
	incomingRequests: TripRequest[];
	sortedPassengers: TripRequest[];
	currentLocation: { lat: number; lng: number; heading?: number; speed?: number } | null;
	mapRouteCoordinates: MapCoordinate[];
	mapStops: DriverMapStop[];
	nextStopDistanceMeters: number | null;
	onAccept: (id: string) => void;
	onDecline: (id: string) => void;
	onAdvance: (id: string, status: RideStatusPayload["status"]) => void;
	onUpdateWalkIn: (count: number) => void;
	onEndShift: () => void;
}>) {
	const totalPassengers = trip.passengers.length + (trip.manualPassengers || 0);
	const remainingSeats = Math.max(0, trip.capacity - totalPassengers);

	return (
		<ScrollView className='flex-1 bg-slate-100' contentContainerClassName='p-4 pb-32 gap-5'>
			{/* Header Card */}
			<View className='rounded-3xl bg-slate-900 p-6 gap-2 shadow-lg border-b-4 border-slate-700'>
				<View className='flex-row items-center gap-3'>
					<View className='bg-emerald-500 w-3 h-3 rounded-full shadow-sm' />
					<Text className='text-slate-400 text-[10px] uppercase font-black tracking-widest'>Active Shift</Text>
				</View>
				<Text className='text-white text-3xl font-black mt-1'>{trip.route.name}</Text>
				<View className='flex-row items-center gap-2 mt-2'>
					<View className='bg-amber-400 px-3 py-1 rounded-lg'>
						<Text className='text-amber-900 text-xs font-bold'>{trip.taxi.licensePlate}</Text>
					</View>
					<Text className='text-slate-300 text-xs font-medium'>Taxi • {trip.taxi.make} {trip.taxi.model}</Text>
				</View>
			</View>

			{/* Live Route Map */}
			<View className='rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm'>
				<View className='p-5 gap-3'>
					<View className='flex-row items-center justify-between'>
						<View className='flex-row items-center gap-2'>
							<Text className='text-2xl'>🗺️</Text>
							<Text className='text-xl font-bold text-slate-900'>Live Route</Text>
						</View>
						<View className='bg-emerald-100 border border-emerald-200 rounded-full px-3 py-1'>
							<Text className='text-emerald-700 text-xs font-bold'>📍 Live GPS</Text>
						</View>
					</View>
				</View>
				<View className="px-4 pb-4">
				    <DriverTripMap
					    routeCoordinates={mapRouteCoordinates}
					    mapStops={mapStops}
					    currentLocation={currentLocation}
					    nextStopDistanceMeters={nextStopDistanceMeters}
				    />
				</View>
			</View>

			{/* Capacity & Walk-in Card */}
			<View className='rounded-3xl bg-white border border-slate-200 p-5 gap-5 shadow-sm'>
				<View className='flex-row items-center gap-2'>
					<Text className='text-2xl'>💺</Text>
					<Text className='text-xl font-bold text-slate-900'>Capacity</Text>
				</View>

				<View className='bg-slate-50 rounded-2xl p-4 gap-4 border border-slate-100'>
					<View className='flex-row justify-between items-center'>
						<Text className='text-slate-600 font-bold text-base'>Total Passengers</Text>
						<Text className='text-slate-900 font-black text-2xl'>{totalPassengers}</Text>
					</View>
					<View className='w-full bg-slate-200 rounded-full h-3'>
						<View
							className={`h-3 rounded-full ${remainingSeats === 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
							style={{ width: `${Math.min(100, (totalPassengers / trip.capacity) * 100)}%` }}
						/>
					</View>
					<View className='flex-row justify-between items-center pt-1'>
						<Text className='text-slate-500 font-bold text-sm'>Remaining Seats</Text>
						<Text className={`font-black text-lg ${remainingSeats === 0 ? 'text-red-500' : 'text-emerald-600'}`}>{remainingSeats}</Text>
					</View>
				</View>

				<View className='flex-row gap-3 pt-1'>
					<Pressable
						onPress={() => onUpdateWalkIn(trip.manualPassengers + 1)}
						disabled={remainingSeats === 0}
						className={`flex-1 rounded-2xl py-4 items-center justify-center border-b-4 shadow-sm ${
						    remainingSeats === 0
						        ? 'bg-slate-200 border-slate-300'
						        : 'bg-emerald-500 border-emerald-700'
						}`}
					>
						<Text className={`font-bold text-base ${remainingSeats === 0 ? 'text-slate-400' : 'text-white'}`}>➕ Walk-in</Text>
					</Pressable>
					<Pressable
						onPress={() => onUpdateWalkIn(Math.max(0, trip.manualPassengers - 1))}
						disabled={trip.manualPassengers === 0}
						className={`flex-1 rounded-2xl border-2 py-4 items-center justify-center shadow-sm ${
						    trip.manualPassengers === 0
						        ? 'bg-slate-50 border-slate-200'
						        : 'bg-white border-red-300'
						}`}
					>
						<Text className={`font-bold text-base ${trip.manualPassengers === 0 ? 'text-slate-400' : 'text-red-500'}`}>➖ Remove</Text>
					</Pressable>
				</View>
			</View>

			{/* Incoming Requests */}
			{incomingRequests.length > 0 && (
				<View className='rounded-3xl bg-blue-50 border border-blue-200 p-5 gap-5 shadow-sm'>
					<View className='flex-row items-center gap-2'>
						<Text className='text-2xl'>📬</Text>
						<Text className='text-xl font-bold text-slate-900 flex-1'>New Requests</Text>
						<View className='bg-red-500 rounded-full px-3 py-1'>
							<Text className='text-white font-black text-sm'>{incomingRequests.length}</Text>
						</View>
					</View>
					<View className='gap-4'>
						{incomingRequests.map((request) => (
							<RequestCard
								key={request.id}
								request={request}
								onAccept={onAccept}
								onDecline={onDecline}
							/>
						))}
					</View>
				</View>
			)}

			{/* Passenger Manifest */}
			<View className='rounded-3xl bg-white border border-slate-200 p-5 gap-5 shadow-sm'>
				<View className='flex-row items-center gap-2'>
					<Text className='text-2xl'>📋</Text>
					<Text className='text-xl font-bold text-slate-900 flex-1'>Manifest</Text>
					{sortedPassengers.length > 0 && (
						<View className='bg-slate-200 rounded-full px-3 py-1'>
							<Text className='text-slate-700 font-black text-sm'>{sortedPassengers.length}</Text>
						</View>
					)}
				</View>

				{sortedPassengers.length === 0 ? (
				    <View className="py-6 items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
				        <Text className="text-4xl mb-2">📭</Text>
				        <Text className="text-slate-500 font-semibold">No active passengers</Text>
				    </View>
				) : (
				    <View className='gap-4'>
					    {sortedPassengers.map((passenger) => (
						    <PassengerCard
							    key={passenger.id}
							    passenger={passenger}
							    onAdvance={onAdvance}
						    />
					    ))}
				    </View>
				)}
			</View>

			{/* End Shift Button */}
			<Pressable
				onPress={onEndShift}
				className='rounded-2xl bg-red-100 border-2 border-red-200 py-4 mt-4 mb-8 items-center justify-center shadow-sm'
			>
				<Text className='font-black text-red-600 text-lg'>🛑 End Shift</Text>
			</Pressable>
		</ScrollView>
	);
}
EOF

echo "Done"