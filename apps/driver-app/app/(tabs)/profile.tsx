import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useDriverProfile } from "../../src/hooks/useDriverProfile";

export default function DriverProfileScreen() {
	const { profile, loading, saving, formData, setProfileField, saveChanges, switchMode, signOutDriver } = useDriverProfile();
	const { height } = useWindowDimensions();

	if (loading) {
		return (
			<View className='flex-1 bg-zinc-100 items-center justify-center gap-3' style={{ minHeight: height }}>
				<ActivityIndicator size='large' color='#f59e0b' />
				<Text className='text-zinc-500'>Loading profile...</Text>
			</View>
		);
	}

	return (
		<ScrollView className='flex-1 bg-zinc-100' contentContainerClassName='p-4 pb-28 gap-4'>
			<View className='rounded-3xl bg-zinc-900 overflow-hidden px-4 py-5'>
				<View className='absolute -top-10 -right-8 h-28 w-28 rounded-full bg-sky-300/30' />
				<View className='absolute top-10 -left-8 h-24 w-24 rounded-full bg-white/10' />
				<Text className='text-2xl font-bold text-white'>My Profile</Text>
				<Text className='text-zinc-300 text-sm mt-1'>Keep your driver details and account settings up to date</Text>
			</View>

			<View className='rounded-2xl bg-white border border-zinc-200 p-5 items-center gap-1 shadow-sm'>
				<View className='h-20 w-20 rounded-full bg-amber-300 items-center justify-center'>
					<Text className='text-xl font-bold text-zinc-800'>{profile?.firstName?.[0] ?? "D"}</Text>
				</View>
				<Text className='text-lg font-bold text-zinc-900 mt-2'>{profile ? `${profile.firstName} ${profile.lastName}` : "Driver Name"}</Text>
				<Text className='text-zinc-500'>{profile?.email ?? "driver@taxicity.com"}</Text>
				<View className='mt-2 px-3 py-1 rounded-full bg-amber-100'>
					<Text className='text-amber-700 text-xs font-semibold'>Driver</Text>
				</View>
			</View>

			<View className='rounded-2xl bg-white border border-zinc-200 p-4 gap-3 shadow-sm'>
				<Text className='text-lg font-semibold text-zinc-900'>Personal Details</Text>
				<View className='gap-1'>
					<Text className='text-zinc-500 text-xs'>Phone Number</Text>
					<TextInput value={formData.phoneNumber} onChangeText={(phoneNumber) => setProfileField("phoneNumber", phoneNumber)} placeholder='Enter your phone number' className='rounded-xl border border-zinc-300 bg-white px-3 py-3 text-zinc-900' />
				</View>
				<View className='gap-1'>
					<Text className='text-zinc-500 text-xs'>Address</Text>
					<TextInput value={formData.address} onChangeText={(address) => setProfileField("address", address)} placeholder='Enter your address' className='rounded-xl border border-zinc-300 bg-white px-3 py-3 text-zinc-900' />
				</View>
				<View className='gap-1'>
					<Text className='text-zinc-500 text-xs'>License Number</Text>
					<TextInput value={formData.licenseNumber} onChangeText={(licenseNumber) => setProfileField("licenseNumber", licenseNumber)} placeholder='Enter your license number' className='rounded-xl border border-zinc-300 bg-white px-3 py-3 text-zinc-900' />
				</View>
				<Pressable onPress={() => void saveChanges()} disabled={saving} className='rounded-xl bg-amber-400 py-3 items-center mt-2'>
					<Text className='font-semibold text-zinc-900'>{saving ? "Saving..." : "Save Changes"}</Text>
				</Pressable>
			</View>

			<View className='gap-3'>
				<Pressable onPress={() => void switchMode()} className='rounded-xl border border-zinc-300 py-3 items-center'>
					<Text className='font-semibold text-zinc-700'>Switch to User Mode</Text>
				</Pressable>
				<Pressable onPress={() => void signOutDriver()} className='rounded-xl border border-red-300 py-3 items-center'>
					<Text className='font-semibold text-red-600'>Sign Out</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
}
