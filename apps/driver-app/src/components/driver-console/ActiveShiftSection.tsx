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
					<Text className='text-slate-300 text-xs font-medium'>Taxi • {trip.taxi.licensePlate}</Text>
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
				<View className='px-4 pb-4'>
					<DriverTripMap routeCoordinates={mapRouteCoordinates} mapStops={mapStops} currentLocation={currentLocation} nextStopDistanceMeters={nextStopDistanceMeters} />
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
						<View className={`h-3 rounded-full ${remainingSeats === 0 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, (totalPassengers / trip.capacity) * 100)}%` }} />
					</View>
					<View className='flex-row justify-between items-center pt-1'>
						<Text className='text-slate-500 font-bold text-sm'>Remaining Seats</Text>
						<Text className={`font-black text-lg ${remainingSeats === 0 ? "text-red-500" : "text-emerald-600"}`}>{remainingSeats}</Text>
					</View>
				</View>

				<View className='flex-row gap-3 pt-1'>
					<Pressable onPress={() => onUpdateWalkIn(trip.manualPassengers + 1)} disabled={remainingSeats === 0} className={`flex-1 rounded-2xl py-4 items-center justify-center border-b-4 shadow-sm ${remainingSeats === 0 ? "bg-slate-200 border-slate-300" : "bg-emerald-500 border-emerald-700"}`}>
						<Text className={`font-bold text-base ${remainingSeats === 0 ? "text-slate-400" : "text-white"}`}>➕ Walk-in</Text>
					</Pressable>
					<Pressable onPress={() => onUpdateWalkIn(Math.max(0, trip.manualPassengers - 1))} disabled={trip.manualPassengers === 0} className={`flex-1 rounded-2xl border-2 py-4 items-center justify-center shadow-sm ${trip.manualPassengers === 0 ? "bg-slate-50 border-slate-200" : "bg-white border-red-300"}`}>
						<Text className={`font-bold text-base ${trip.manualPassengers === 0 ? "text-slate-400" : "text-red-500"}`}>➖ Remove</Text>
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
							<RequestCard key={request.id} request={request} onAccept={onAccept} onDecline={onDecline} />
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
					<View className='py-6 items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50'>
						<Text className='text-4xl mb-2'>📭</Text>
						<Text className='text-slate-500 font-semibold'>No active passengers</Text>
					</View>
				) : (
					<View className='gap-4'>
						{sortedPassengers.map((passenger) => (
							<PassengerCard key={passenger.id} passenger={passenger} onAdvance={onAdvance} />
						))}
					</View>
				)}
			</View>

			{/* End Shift Button */}
			<Pressable onPress={onEndShift} className='rounded-2xl bg-red-100 border-2 border-red-200 py-4 mt-4 mb-8 items-center justify-center shadow-sm'>
				<Text className='font-black text-red-600 text-lg'>🛑 End Shift</Text>
			</Pressable>
		</ScrollView>
	);
}
