import { useState } from "react";
import { ActivityIndicator, Alert, Text, View, useWindowDimensions } from "react-native";
import { ActiveShiftSection } from "../../components/driver-console/ActiveShiftSection";
import { StartShiftSection } from "../../components/driver-console/StartShiftSection";
import { useDriverConsole } from "./useDriverConsole";

export function DriverConsoleNative() {
	const state = useDriverConsole();
	const [busy, setBusy] = useState(false);
	const { height } = useWindowDimensions();

	if (state.isLoading) {
		return (
			<View className='flex-1 items-center justify-center bg-zinc-100 gap-3' style={{ minHeight: height }}>
				<ActivityIndicator size='large' color='#f59e0b' />
				<Text className='text-zinc-500'>Loading active shift console...</Text>
			</View>
		);
	}

	if (!state.driver) {
		return (
			<View className='flex-1 items-center justify-center bg-zinc-100 px-5' style={{ minHeight: height }}>
				<View className='w-full max-w-md rounded-2xl bg-white p-6 border border-zinc-200 gap-3'>
					<Text className='text-2xl font-bold text-zinc-900'>Profile Not Found</Text>
					<Text className='text-zinc-500'>We could not find your driver profile.</Text>
				</View>
			</View>
		);
	}

	if (!state.activeVehicleTrip) {
		return (
			<StartShiftSection
				driver={state.driver}
				ranks={state.ranks}
				queueStatus={state.queueStatus}
				busy={busy}
				onStartShift={async (taxiId, routeId) => {
					setBusy(true);
					await state.startShift(taxiId, routeId);
					setBusy(false);
				}}
				onJoinQueue={async (rankId, taxiId) => {
					setBusy(true);
					try {
						const position = await state.joinQueue(rankId, taxiId);
						if (position) {
							Alert.alert("Queue Joined", `You are #${position} in line.`);
						}
					} finally {
						setBusy(false);
					}
				}}
				onLeaveQueue={async () => {
					setBusy(true);
					await state.leaveQueue();
					setBusy(false);
				}}
			/>
		);
	}

	return (
		<ActiveShiftSection
			trip={state.activeVehicleTrip}
			incomingRequests={state.incomingRequests}
			sortedPassengers={state.sortedPassengers}
			currentLocation={state.currentLocation}
			mapRouteCoordinates={state.mapRouteCoordinates}
			mapStops={state.mapStops}
			nextStopDistanceMeters={state.nextStopDistanceMeters}
			onAccept={(id) => void state.acceptRequest(id)}
			onDecline={(id) => void state.declineRequest(id)}
			onAdvance={(id, status) => void state.updatePassengerStatus(id, status)}
			onUpdateWalkIn={(count) => void state.updateManualPassengers(count)}
			onEndShift={() => void state.endShift()}
		/>
	);
}
