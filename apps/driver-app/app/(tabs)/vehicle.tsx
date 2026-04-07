import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDriverVehicle } from "../../src/hooks/useDriverVehicle";

export default function DriverVehicleScreen() {
	const { loading, taxis, hasVehicles, showRegistration, openRegistration, closeRegistration, registeringVehicle, selectedTaxi, setSelectedTaxi, routes, selectedRouteId, setSelectedRouteId, permitFile, pickPermitFile, updatingRoute, formData, setFormField, handleRegisterVehicle, handleUpdateRoute, closeRouteModal } = useDriverVehicle();
	const { height } = useWindowDimensions();

	if (loading) {
		return (
			<View className='flex-1 bg-zinc-100 items-center justify-center gap-3' style={{ minHeight: height }}>
				<ActivityIndicator size='large' color='#f59e0b' />
				<Text className='text-zinc-500'>Loading vehicles...</Text>
			</View>
		);
	}

	if (showRegistration || !hasVehicles) {
		return (
			<ScrollView className='flex-1 bg-zinc-100' contentContainerClassName='p-4 pb-28 gap-4'>
				<View className='flex-row items-center gap-2'>
					{hasVehicles ? (
						<Pressable onPress={closeRegistration} className='h-10 w-10 rounded-full bg-white border border-zinc-200 items-center justify-center'>
							<MaterialCommunityIcons name='arrow-left' size={20} color='#3f3f46' />
						</Pressable>
					) : null}
					<Text className='text-2xl font-bold text-zinc-900'>Register Vehicle</Text>
				</View>

				<View className='rounded-2xl bg-white border border-zinc-200 p-5 gap-3 shadow-sm'>
					<View className='items-center gap-2 mb-2'>
						<View className='h-14 w-14 rounded-full bg-amber-100 items-center justify-center'>
							<MaterialCommunityIcons name='car-estate' size={28} color='#f59e0b' />
						</View>
						<Text className='text-lg font-bold text-zinc-900'>Register Your Vehicle</Text>
						<Text className='text-zinc-500 text-center'>Enter your taxi details to start accepting trips.</Text>
					</View>

					<TextInput value={formData.plateNumber} onChangeText={(plateNumber) => setFormField("plateNumber", plateNumber)} placeholder='Plate Number (e.g. ABC 123 GP)' className='rounded-xl border border-zinc-300 px-3 py-3 bg-white text-zinc-900' />
					<View className='flex-row gap-3'>
						<TextInput value={formData.make} onChangeText={(make) => setFormField("make", make)} placeholder='Make' className='flex-1 rounded-xl border border-zinc-300 px-3 py-3 bg-white text-zinc-900' />
						<TextInput value={formData.model} onChangeText={(model) => setFormField("model", model)} placeholder='Model' className='flex-1 rounded-xl border border-zinc-300 px-3 py-3 bg-white text-zinc-900' />
					</View>
					<View className='flex-row gap-3'>
						<TextInput value={formData.color} onChangeText={(color) => setFormField("color", color)} placeholder='Color' className='flex-1 rounded-xl border border-zinc-300 px-3 py-3 bg-white text-zinc-900' />
						<TextInput value={formData.seats} onChangeText={(seats) => setFormField("seats", seats)} keyboardType='numeric' placeholder='Seats' className='flex-1 rounded-xl border border-zinc-300 px-3 py-3 bg-white text-zinc-900' />
					</View>

					<Pressable onPress={handleRegisterVehicle} disabled={registeringVehicle} className='rounded-xl bg-amber-400 py-3 items-center mt-2'>
						<Text className='font-semibold text-zinc-900'>{registeringVehicle ? "Registering..." : "Register Vehicle"}</Text>
					</Pressable>
				</View>
			</ScrollView>
		);
	}

	return (
		<ScrollView className='flex-1 bg-zinc-100' contentContainerClassName='p-4 pb-28 gap-4'>
			<View className='rounded-3xl bg-zinc-900 overflow-hidden px-4 py-5'>
				<View className='absolute -top-10 -right-8 h-28 w-28 rounded-full bg-amber-300/30' />
				<View className='absolute top-10 -left-8 h-24 w-24 rounded-full bg-white/10' />
				<View className='flex-row justify-between items-center'>
					<View>
						<Text className='text-2xl font-bold text-white'>My Vehicles</Text>
						<Text className='text-zinc-300 text-sm mt-1'>Manage taxi details and route assignments</Text>
					</View>
					<Pressable onPress={openRegistration} className='rounded-xl bg-amber-400 px-4 py-2'>
						<Text className='font-semibold text-zinc-900'>Add Vehicle</Text>
					</Pressable>
				</View>
			</View>

			{taxis.map((taxi) => (
				<View key={taxi.id} className='rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-sm'>
					<View className='p-4 border-b border-zinc-100 flex-row items-start justify-between'>
						<View>
							<View className='flex-row items-center gap-2'>
								<Text className='text-lg font-bold text-zinc-900'>
									{taxi.make} {taxi.model}
								</Text>
								<View className='px-2 py-0.5 rounded-full bg-zinc-100'>
									<Text className='text-[10px] text-zinc-600 font-semibold'>{taxi.year}</Text>
								</View>
							</View>
							<Text className='text-zinc-500 font-semibold mt-1'>{taxi.licensePlate}</Text>
						</View>
						<View className='px-2 py-1 rounded-full bg-emerald-100'>
							<Text className='text-[10px] font-semibold text-emerald-700'>{taxi.status}</Text>
						</View>
					</View>

					<View className='p-4 gap-3'>
						<View className='flex-row justify-between'>
							<View>
								<Text className='text-[11px] uppercase text-zinc-400'>Color</Text>
								<Text className='text-zinc-800 mt-1 capitalize'>{taxi.color}</Text>
							</View>
							<View>
								<Text className='text-[11px] uppercase text-zinc-400'>Capacity</Text>
								<Text className='text-zinc-800 mt-1'>{taxi.capacity} Seats</Text>
							</View>
						</View>

						{taxi.routes && taxi.routes.length > 0 ? (
							<View className='gap-2'>
								<Text className='text-[11px] uppercase text-zinc-400'>Active Route</Text>
								<View className='flex-row flex-wrap gap-2'>
									{taxi.routes.map((route) => (
										<View key={route.id} className='px-3 py-1 rounded-full bg-indigo-100'>
											<Text className='text-xs font-semibold text-indigo-700'>{route.route.name}</Text>
										</View>
									))}
								</View>
							</View>
						) : null}

						<View className='flex-row gap-2'>
							<Pressable onPress={() => setSelectedTaxi(taxi)} className='flex-1 rounded-xl border border-zinc-300 py-2 items-center'>
								<Text className='text-zinc-700 font-medium'>Manage Route</Text>
							</Pressable>
							<Pressable className='flex-1 rounded-xl border border-zinc-300 py-2 items-center'>
								<Text className='text-zinc-700 font-medium'>Edit Details</Text>
							</Pressable>
						</View>
					</View>
				</View>
			))}

			<Modal visible={Boolean(selectedTaxi)} transparent animationType='slide' onRequestClose={closeRouteModal}>
				<View className='flex-1 bg-black/40 justify-end'>
					<View className='bg-white rounded-t-3xl p-5 gap-4 pb-8'>
						<Text className='text-xl font-bold text-zinc-900'>Manage Route</Text>
						<Text className='text-zinc-500 text-sm'>Select a new route and upload your updated permit document.</Text>

						<View className='gap-2'>
							<Text className='text-zinc-500 text-xs'>Select Route</Text>
							<View className='rounded-xl border border-zinc-300 p-2'>
								<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName='gap-2'>
									{routes.map((route) => {
										const active = selectedRouteId === route.id;
										return (
											<Pressable key={route.id} onPress={() => setSelectedRouteId(route.id)} className={`px-3 py-2 rounded-lg ${active ? "bg-amber-400" : "bg-zinc-100"}`}>
												<Text className={active ? "text-zinc-900 font-semibold" : "text-zinc-700"}>{route.name}</Text>
											</Pressable>
										);
									})}
								</ScrollView>
							</View>
						</View>

						<View className='gap-2'>
							<Text className='text-zinc-500 text-xs'>Permit Document</Text>
							<Pressable onPress={pickPermitFile} className='rounded-xl border border-zinc-300 px-3 py-3 bg-white'>
								<Text className='text-zinc-800'>{permitFile?.name ?? "Tap to select permit file"}</Text>
							</Pressable>
						</View>

						<View className='flex-row gap-3'>
							<Pressable onPress={closeRouteModal} className='flex-1 rounded-xl border border-zinc-300 py-3 items-center'>
								<Text className='font-semibold text-zinc-700'>Cancel</Text>
							</Pressable>
							<Pressable onPress={handleUpdateRoute} disabled={updatingRoute || !selectedRouteId || !permitFile} className='flex-1 rounded-xl bg-amber-400 py-3 items-center'>
								<Text className='font-semibold text-zinc-900'>{updatingRoute ? "Updating..." : "Update Route"}</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}
