import { router } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useDriverApply } from "../src/hooks/useDriverApply";

export default function DriverApplyScreen() {
	const apply = useDriverApply({ onSubmitted: () => router.replace("/status") });

	return (
		<ScrollView className='flex-1 bg-zinc-100' contentContainerClassName='p-4 pb-10 gap-4'>
			<View className='gap-1'>
				<Text className='text-3xl font-bold text-zinc-900'>Become a Driver</Text>
				<Text className='text-zinc-500'>Complete the application to start earning.</Text>
			</View>

			<View className='rounded-2xl bg-white border border-zinc-200 p-3'>
				<Text className='text-zinc-700 text-sm font-semibold'>Step {apply.step} of 4</Text>
				<View className='flex-row mt-2 gap-2'>
					{[1, 2, 3, 4].map((item) => (
						<View key={item} className={`flex-1 h-2 rounded-full ${item <= apply.step ? "bg-amber-400" : "bg-zinc-200"}`} />
					))}
				</View>
			</View>

			{apply.error ? (
				<View className='rounded-2xl bg-red-50 border border-red-200 p-4'>
					<Text className='text-red-700 text-sm'>{apply.error}</Text>
				</View>
			) : null}

			{apply.step === 1 ? (
				<View className='rounded-2xl bg-white border border-zinc-200 p-4 gap-3'>
					<Text className='text-lg font-semibold text-zinc-900'>Driver Information</Text>
					<TextInput value={apply.form.licenseNumber} onChangeText={(value) => apply.setField("licenseNumber", value)} placeholder="Driver's license number" className='rounded-xl border border-zinc-300 px-3 py-3 bg-white' />
					<TextInput value={apply.form.licenseExpiry} onChangeText={(value) => apply.setField("licenseExpiry", value)} placeholder='License expiry (YYYY-MM-DD)' className='rounded-xl border border-zinc-300 px-3 py-3 bg-white' />

					<View className='flex-row gap-2'>
						<Pressable onPress={() => void apply.uploadForField("licenseImageFront")} className='flex-1 rounded-xl border border-zinc-300 py-3 items-center'>
							<Text className='text-zinc-700 text-xs'>{apply.getFieldUploadLabel("licenseImageFront")}</Text>
						</Pressable>
						<Pressable onPress={() => void apply.uploadForField("licenseImageBack")} className='flex-1 rounded-xl border border-zinc-300 py-3 items-center'>
							<Text className='text-zinc-700 text-xs'>{apply.getFieldUploadLabel("licenseImageBack")}</Text>
						</Pressable>
					</View>

					<Pressable onPress={() => apply.setStep(2)} disabled={!apply.canContinueStep1} className='rounded-xl bg-amber-400 py-3 items-center mt-2'>
						<Text className='font-semibold text-zinc-900'>Next</Text>
					</Pressable>
				</View>
			) : null}

			{apply.step === 2 ? (
				<View className='rounded-2xl bg-white border border-zinc-200 p-4 gap-3'>
					<Text className='text-lg font-semibold text-zinc-900'>Vehicle Information</Text>
					<TextInput value={apply.form.plateNumber} onChangeText={(value) => apply.setField("plateNumber", value)} placeholder='Plate number' className='rounded-xl border border-zinc-300 px-3 py-3 bg-white' />
					<TextInput value={apply.form.make} onChangeText={(value) => apply.setField("make", value)} placeholder='Vehicle make' className='rounded-xl border border-zinc-300 px-3 py-3 bg-white' />
					<TextInput value={apply.form.model} onChangeText={(value) => apply.setField("model", value)} placeholder='Vehicle model' className='rounded-xl border border-zinc-300 px-3 py-3 bg-white' />
					<View className='flex-row gap-2'>
						<TextInput value={apply.form.year} onChangeText={(value) => apply.setField("year", value)} keyboardType='numeric' placeholder='Year' className='flex-1 rounded-xl border border-zinc-300 px-3 py-3 bg-white' />
						<TextInput value={apply.form.color} onChangeText={(value) => apply.setField("color", value)} placeholder='Color' className='flex-1 rounded-xl border border-zinc-300 px-3 py-3 bg-white' />
					</View>
					<TextInput value={apply.form.capacity} onChangeText={(value) => apply.setField("capacity", value)} keyboardType='numeric' placeholder='Capacity' className='rounded-xl border border-zinc-300 px-3 py-3 bg-white' />

					<View className='flex-row gap-2 mt-2'>
						<Pressable onPress={() => apply.setStep(1)} className='flex-1 rounded-xl border border-zinc-300 py-3 items-center'>
							<Text className='font-semibold text-zinc-700'>Back</Text>
						</Pressable>
						<Pressable onPress={() => apply.setStep(3)} disabled={!apply.canContinueStep2} className='flex-1 rounded-xl bg-amber-400 py-3 items-center'>
							<Text className='font-semibold text-zinc-900'>Next</Text>
						</Pressable>
					</View>
				</View>
			) : null}

			{apply.step === 3 ? (
				<View className='rounded-2xl bg-white border border-zinc-200 p-4 gap-3'>
					<Text className='text-lg font-semibold text-zinc-900'>Route Selection</Text>
					<Text className='text-zinc-500 text-sm'>Select the route you will operate on.</Text>

					{apply.loadingRoutes ? <Text className='text-zinc-500 text-sm'>Loading routes...</Text> : null}
					{apply.routesError ? <Text className='text-red-700 text-sm'>{apply.routesError}</Text> : null}

					<TextInput value={apply.routeSearch} onChangeText={apply.setRouteSearch} placeholder='Search route' className='rounded-xl border border-zinc-300 px-3 py-3 bg-white' />

					<View className='rounded-xl border border-zinc-300 p-2 max-h-56'>
						<ScrollView>
							{apply.filteredRoutes.map((route) => {
								const active = route.id === apply.form.routeId;
								return (
									<Pressable key={route.id} onPress={() => apply.setField("routeId", route.id)} className={`rounded-lg px-3 py-2 mb-1 ${active ? "bg-amber-100" : "bg-zinc-50"}`}>
										<Text className={active ? "text-amber-800 font-semibold" : "text-zinc-700"}>{route.name}</Text>
									</Pressable>
								);
							})}
							{!apply.loadingRoutes && apply.filteredRoutes.length === 0 ? <Text className='text-zinc-500 text-sm p-2'>No routes found.</Text> : null}
						</ScrollView>
					</View>

					<View className='flex-row gap-2 mt-2'>
						<Pressable onPress={() => apply.setStep(2)} className='flex-1 rounded-xl border border-zinc-300 py-3 items-center'>
							<Text className='font-semibold text-zinc-700'>Back</Text>
						</Pressable>
						<Pressable onPress={() => apply.setStep(4)} disabled={!apply.canContinueStep3} className='flex-1 rounded-xl bg-amber-400 py-3 items-center'>
							<Text className='font-semibold text-zinc-900'>Next</Text>
						</Pressable>
					</View>
				</View>
			) : null}

			{apply.step === 4 ? (
				<View className='rounded-2xl bg-white border border-zinc-200 p-4 gap-3'>
					<Text className='text-lg font-semibold text-zinc-900'>Document Upload</Text>
					<Text className='text-zinc-500 text-sm'>Upload registration, insurance, and operating permit documents.</Text>

					<Pressable onPress={() => void apply.uploadForField("registrationDoc")} className='rounded-xl border border-zinc-300 py-3 items-center'>
						<Text className='text-zinc-700 text-xs'>{apply.getFieldUploadLabel("registrationDoc")}</Text>
					</Pressable>
					<Pressable onPress={() => void apply.uploadForField("insuranceDoc")} className='rounded-xl border border-zinc-300 py-3 items-center'>
						<Text className='text-zinc-700 text-xs'>{apply.getFieldUploadLabel("insuranceDoc")}</Text>
					</Pressable>
					<Pressable onPress={() => void apply.uploadForField("permitDoc")} className='rounded-xl border border-zinc-300 py-3 items-center'>
						<Text className='text-zinc-700 text-xs'>{apply.getFieldUploadLabel("permitDoc")}</Text>
					</Pressable>

					<View className='flex-row gap-2 mt-2'>
						<Pressable onPress={() => apply.setStep(3)} className='flex-1 rounded-xl border border-zinc-300 py-3 items-center'>
							<Text className='font-semibold text-zinc-700'>Back</Text>
						</Pressable>
						<Pressable onPress={() => void apply.submitApplication()} disabled={!apply.canSubmit || apply.submitting} className='flex-1 rounded-xl bg-amber-400 py-3 items-center'>
							<Text className='font-semibold text-zinc-900'>{apply.submitting ? "Submitting..." : "Submit"}</Text>
						</Pressable>
					</View>
				</View>
			) : null}

			<Pressable onPress={() => router.back()} className='rounded-xl border border-zinc-300 py-3 items-center'>
				<Text className='font-semibold text-zinc-700'>Cancel</Text>
			</Pressable>
		</ScrollView>
	);
}
