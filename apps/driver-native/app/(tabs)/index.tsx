import React from "react";
import { View, Text } from "react-native";
import { Spinner } from "heroui-native/spinner";
import { Button } from "heroui-native/button";
import { Feather } from "@expo/vector-icons";
import { useDriver } from "@context/DriverContext";
import { DriverConsole } from "@components/DriverConsole";
import { VehicleRegistration } from "@components/VehicleRegistration";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useUser } from "@clerk/expo";
import { router } from "expo-router";

export default function DriverPage() {
	const { driver, isLoading, refreshDriver } = useDriver();
	const { user, isLoaded } = useUser();

	if (isLoaded && !user) {
		return (
			<View className='flex-1 justify-center items-center bg-default-50 p-4'>
				<Animated.View entering={FadeInDown} className='items-center max-w-md space-y-4'>
					<View className='w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mb-4'>
						<Feather name='alert-circle' size={40} color='#f31260' />
					</View>
					<Text className='text-2xl font-bold text-default-900 text-center'>Not Signed In</Text>
					<Text className='text-default-500 text-center mb-4'>You need to be signed in to access the driver console. Please sign in or create an account.</Text>
					<View className='flex-row gap-3 justify-center pt-2'>
						<Button onPress={() => router.push("/sign-in")} variant='primary'>
							<Feather name='log-in' size={20} color='white' />
							<Button.Label>Sign In</Button.Label>
						</Button>
						<Button onPress={() => router.push("/sign-up")} variant='outline'>
							<Feather name='user-plus' size={20} color='#666' />
							<Button.Label>Create Account</Button.Label>
						</Button>
					</View>
				</Animated.View>
			</View>
		);
	}

	if (isLoading) {
		return (
			<View className='flex-1 justify-center items-center bg-default-50 gap-4'>
				<Spinner size='lg' color='primary' />
				<Text className='text-default-500'>Loading driver profile...</Text>
			</View>
		);
	}

	if (!driver) {
		return (
			<View className='flex-1 justify-center items-center bg-default-50 p-4'>
				<Animated.View entering={FadeInDown} className='items-center max-w-md space-y-4'>
					<View className='w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mb-4'>
						<Feather name='alert-circle' size={40} color='#f31260' />
					</View>
					<Text className='text-2xl font-bold text-default-900 text-center'>Profile Not Found</Text>
					<Text className='text-default-500 text-center mb-4'>We couldn&apos;t find your driver profile. If you haven&apos;t applied yet, please submit an application.</Text>
					<View className='flex-row gap-3 justify-center pt-2'>
						<Button onPress={() => router.push("/apply")} variant='primary'>
							<Feather name='file-text' size={20} color='white' />
							<Button.Label>Apply Now</Button.Label>
						</Button>
						<Button onPress={() => router.push("/support")} variant='outline'>
							<Feather name='help-circle' size={20} color='#666' />
							<Button.Label>Contact Support</Button.Label>
						</Button>
					</View>
				</Animated.View>
			</View>
		);
	}

	// Step 1: Vehicle Registration
	if (driver.taxis?.length === 0) {
		return (
			<View className='flex-1 bg-default-50 justify-center p-4'>
				<VehicleRegistration onComplete={refreshDriver} />
			</View>
		);
	}

	// Step 2: Driver Console (Handles Shift Start & Active Shift)
	return (
		<View className='flex-1 overflow-hidden relative'>
			<DriverConsole />
		</View>
	);
}
