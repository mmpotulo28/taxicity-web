import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useDriverProfile, useUpdateDriverProfile } from "../../src/features/driver-profile/hooks/use-driver-profile";
import { ErrorState, LoadingState } from "../../src/shared/ui/state-screen";

export default function ProfileTab() {
	const { data, isLoading, isError, error, refetch } = useDriverProfile(true);
	const updateProfile = useUpdateDriverProfile();

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [address, setAddress] = useState("");

	useEffect(() => {
		if (!data) {
			return;
		}

		setFirstName(data.firstName ?? "");
		setLastName(data.lastName ?? "");
		setPhone(data.phone ?? "");
		setEmail(data.email ?? "");
		setAddress(data.address ?? "");
	}, [data]);

	if (isLoading) {
		return <LoadingState label='Loading profile...' />;
	}

	if (isError) {
		return <ErrorState title='Profile load failed' message={error?.message ?? "Unknown profile error"} onRetry={() => void refetch()} />;
	}

	const onSave = async () => {
		await updateProfile.mutateAsync({
			firstName,
			lastName,
			phone,
			email,
			address,
		});
	};

	return (
		<ScrollView className='flex-1 bg-zinc-950' contentContainerStyle={{ padding: 16, gap: 12 }}>
			<Text className='text-2xl font-semibold text-white'>Profile</Text>
			<Text className='mt-1 text-zinc-300'>Status: {data?.status ?? "UNKNOWN"}</Text>

			<TextInput placeholder='First name' placeholderTextColor='#71717A' value={firstName} onChangeText={setFirstName} className='rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white' />
			<TextInput placeholder='Last name' placeholderTextColor='#71717A' value={lastName} onChangeText={setLastName} className='rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white' />
			<TextInput placeholder='Phone' placeholderTextColor='#71717A' value={phone} onChangeText={setPhone} keyboardType='phone-pad' className='rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white' />
			<TextInput placeholder='Email' placeholderTextColor='#71717A' value={email} onChangeText={setEmail} keyboardType='email-address' autoCapitalize='none' className='rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white' />
			<TextInput placeholder='Address' placeholderTextColor='#71717A' value={address} onChangeText={setAddress} className='rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white' />

			{updateProfile.isError ? <Text className='text-red-300'>{updateProfile.error?.message ?? "Could not update profile"}</Text> : null}

			<Pressable onPress={() => void onSave()} disabled={updateProfile.isPending} className='mt-2 items-center rounded-lg bg-yellow-400 px-4 py-3'>
				<Text className='font-semibold text-zinc-900'>{updateProfile.isPending ? "Saving..." : "Save profile"}</Text>
			</Pressable>
		</ScrollView>
	);
}
