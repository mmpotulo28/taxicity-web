import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
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
