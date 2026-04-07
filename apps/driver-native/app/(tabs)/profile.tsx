import React from "react";
import { View, Text } from "react-native";
import { useUser, useAuth } from "@clerk/expo";
import { Button } from "heroui-native/button";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ProfileTab() {
	const { user } = useUser();
	const { signOut } = useAuth();

	const handleSignOut = async () => {
		try {
			await signOut();
			router.push("/");
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<View className='flex-1 bg-default-50 justify-center items-center p-4'>
			<View className='w-24 h-24 bg-primary/10 rounded-full flex justify-center items-center mb-6'>
				<Feather name='user' size={48} color='#f31260' />
			</View>

			<Text className='text-2xl font-bold text-default-900 text-center mb-2'>{user?.fullName || "Driver Profile"}</Text>
			<Text className='text-default-500 mb-8'>{user?.primaryEmailAddress?.emailAddress}</Text>

			{user ? (
				<Button onPress={handleSignOut} variant='danger-soft'>
					<Feather name='log-out' size={20} color='#f31260' />
					<Button.Label>Sign Out</Button.Label>
				</Button>
			) : (
				<Button onPress={() => router.push("/sign-in")} variant='primary'>
					<Feather name='log-in' size={20} color='white' />
					<Button.Label>Sign In</Button.Label>
				</Button>
			)}
		</View>
	);
}
