import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { setHasCompletedOnboarding } from "../../src/lib/onboarding";

const slides = [
	{
		id: "discover",
		tag: "Welcome to TaxiCiTi",
		title: "Drive Smarter, Earn Better",
		description: "A modern driver console built for speed: instant requests, live trip intelligence, and fewer taps when every second counts.",
		accent: "#f59e0b",
		icon: "lightning-bolt-circle",
		highlights: ["Realtime ride requests", "Fast accept and route flow", "Designed for township and city travel"],
	},
	{
		id: "control",
		tag: "Control Your Shift",
		title: "One Place for Route, Queue, and Passengers",
		description: "Start shift in roaming or rank mode, track passengers in-app, and keep your route progression clear from pickup to dropoff.",
		accent: "#22c55e",
		icon: "map-marker-path",
		highlights: ["Rank and roaming operations", "Passenger and seat visibility", "Route-focused map guidance"],
	},
	{
		id: "growth",
		tag: "Grow with TaxiCiTi",
		title: "Reliable Earnings, Trusted Platform",
		description: "Your performance, earnings, and profile tools stay synchronized so you can focus on safe trips and consistent income.",
		accent: "#38bdf8",
		icon: "chart-timeline-variant",
		highlights: ["Live earning insights", "Driver profile and vehicle tools", "Secure account and session management"],
	},
] as const;

export default function DriverOnboardingScreen() {
	const [activeIndex, setActiveIndex] = useState(0);
	const activeSlide = slides[activeIndex];
	const isLastSlide = activeIndex === slides.length - 1;
	const { height } = useWindowDimensions();

	const buttonLabel = useMemo(() => (isLastSlide ? "Get Started" : "Next"), [isLastSlide]);

	async function completeAndNavigate(target: "signIn" | "signUp") {
		await setHasCompletedOnboarding();
		router.replace(`/(auth)/sign-in?mode=${target}`);
	}

	return (
		<View className='flex-1 bg-slate-950 px-5 pt-16 pb-10'>
			<View className='absolute top-0 left-0 right-0 h-72' style={{ backgroundColor: `${activeSlide.accent}25` }} />
			<View className='absolute -top-16 -right-10 h-44 w-44 rounded-full' style={{ backgroundColor: `${activeSlide.accent}45` }} />
			<View className='absolute top-24 -left-12 h-36 w-36 rounded-full' style={{ backgroundColor: "#ffffff10" }} />

			<View className='flex-1 justify-center gap-8' style={{ minHeight: height - 104 }}>
				<View className='gap-5'>
					<View className='self-start rounded-full px-3 py-1 border border-white/20 bg-white/10'>
						<Text className='text-xs font-semibold text-zinc-100'>{activeSlide.tag}</Text>
					</View>

					<View className='rounded-3xl border border-white/15 bg-white/10 p-5 gap-4'>
						<View className='h-14 w-14 rounded-2xl items-center justify-center' style={{ backgroundColor: `${activeSlide.accent}35` }}>
							<MaterialCommunityIcons name={activeSlide.icon} size={28} color={activeSlide.accent} />
						</View>

						<View className='gap-2'>
							<Text className='text-3xl font-bold text-white'>{activeSlide.title}</Text>
							<Text className='text-sm leading-6 text-zinc-300'>{activeSlide.description}</Text>
						</View>

						<View className='gap-2'>
							{activeSlide.highlights.map((item) => (
								<View key={item} className='flex-row items-center gap-2'>
									<View className='h-2 w-2 rounded-full' style={{ backgroundColor: activeSlide.accent }} />
									<Text className='text-zinc-200 text-sm'>{item}</Text>
								</View>
							))}
						</View>
					</View>
				</View>

				<View className='gap-4'>
					<View className='flex-row items-center justify-center gap-2'>
						{slides.map((slide, index) => (
							<View key={slide.id} className={`h-2 rounded-full ${index === activeIndex ? "w-8" : "w-2"}`} style={{ backgroundColor: index === activeIndex ? activeSlide.accent : "#ffffff44" }} />
						))}
					</View>

					{isLastSlide ? (
						<View className='gap-3'>
							<Pressable onPress={() => void completeAndNavigate("signIn")} className='rounded-2xl py-4 items-center' style={{ backgroundColor: "#f59e0b" }}>
								<Text className='font-bold text-zinc-900 text-base'>Login</Text>
							</Pressable>
							<Pressable onPress={() => void completeAndNavigate("signUp")} className='rounded-2xl py-4 items-center border border-white/30 bg-white/10'>
								<Text className='font-bold text-white text-base'>Sign Up</Text>
							</Pressable>
						</View>
					) : (
						<View className='flex-row gap-3'>
							<Pressable onPress={() => setActiveIndex(slides.length - 1)} className='flex-1 rounded-2xl py-4 items-center border border-white/30 bg-white/10'>
								<Text className='font-semibold text-zinc-100'>Skip</Text>
							</Pressable>
							<Pressable onPress={() => setActiveIndex((prev) => Math.min(prev + 1, slides.length - 1))} className='flex-1 rounded-2xl py-4 items-center' style={{ backgroundColor: activeSlide.accent }}>
								<Text className='font-bold text-zinc-900'>{buttonLabel}</Text>
							</Pressable>
						</View>
					)}
				</View>
			</View>
		</View>
	);
}
