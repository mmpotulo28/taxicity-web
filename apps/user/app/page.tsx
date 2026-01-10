"use client";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

import { useRide, TripCard, TripRating, MapView, Header } from "@taxicity/ui";
import { NotificationBell } from "@/components/NotificationBell";

export default function Home() {
	const router = useRouter();
	const { tripHistory, activeTrip } = useRide();

	const onRequestRide = () => {
		if (activeTrip && activeTrip.status !== "completed") {
			router.push("/ride/track");
		} else {
			router.push("/ride/route");
		}
	};

	const showRating = activeTrip?.status === "completed";

	return (
		<div className="relative h-full">
			{/* Fullscreen map as background */}
			<MapView centerOnRank showTaxis fullscreen={true} zIndex={0} />

			<Header endContent={<NotificationBell />} />

			{/* Overlay content */}
			{showRating ? (
				<div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-end p-4 pb-20 pointer-events-none z-10">
					<div className="pointer-events-auto">
						<TripRating trip={activeTrip} />
					</div>
				</div>
			) : (
				<div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col z-10">
					{/* Middle space for map viewing */}
					<div className="flex-1" />

					{/* Bottom content */}
					<div className="bg-background rounded-t-2xl p-4 space-y-4">
						<SignedIn>
							<div className="space-y-6">
								{/* Primary Action */}
								<div className="space-y-2">
									{activeTrip ? (
										<div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm font-bold text-secondary-600">Trip in Progress</span>
												<Chip size="sm" color="secondary" variant="flat" className="text-xs">On Route</Chip>
											</div>
											<Button
												className="w-full font-semibold shadow-md shadow-secondary/20"
												color="secondary"
												endContent={<Icon icon="lucide:map-pin" />}
												size="lg"
												onPress={onRequestRide}>
												Track Ride
											</Button>
										</div>
									) : (
										<Button
											className="w-full font-bold text-lg h-14 shadow-lg shadow-primary/20"
											color="primary"
											endContent={<Icon icon="lucide:arrow-right" />}
											size="lg"
											onPress={onRequestRide}>
											Where to?
										</Button>
									)}
								</div>

								{/* Quick Actions */}
								<div className="grid grid-cols-2 gap-3">
									<Button
										as={Link}
										className="bg-default-50 border border-default-100 h-24 flex-col gap-2 hover:bg-default-100"
										color="default"
										href="/ride/trip/history"
										variant="light">
										<div className="p-2 rounded-full bg-background shadow-sm">
											<Icon icon="lucide:clock" className="text-xl text-primary" />
										</div>
										<span className="text-xs font-semibold text-default-600">History</span>
									</Button>
									<Button
										as={Link}
										className="bg-default-50 border border-default-100 h-24 flex-col gap-2 hover:bg-default-100"
										color="default"
										href="/settings"
										variant="light">
										<div className="p-2 rounded-full bg-background shadow-sm">
											<Icon icon="lucide:settings" className="text-xl text-primary" />
										</div>
										<span className="text-xs font-semibold text-default-600">Settings</span>
									</Button>
								</div>

								{/* Recent Activity */}
								<div className="space-y-3 pt-2">
									<div className="flex justify-between items-center px-1">
										<h3 className="text-sm font-bold text-default-700">Recent Activity</h3>
										{tripHistory && tripHistory.length > 0 && (
											<Link href="/ride/trip/history" className="text-[10px] text-primary font-medium hover:underline flex items-center gap-0.5">
												View All <Icon icon="lucide:chevron-right" />
											</Link>
										)}
									</div>

									{tripHistory && tripHistory.length > 0 ? (
										<div className="space-y-2">
											{tripHistory.slice(0, 2).map((trip) => (
												<TripCard
													key={trip.id}
													trip={trip}
													onSelect={() => router.push(`/ride/trip/history`)}
												/>
											))}
										</div>
									) : (
										<div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-default-100 rounded-xl bg-default-50/50">
											<div className="p-3 bg-background rounded-full mb-3 shadow-sm text-default-400">
												<Icon icon="lucide:car-taxi-front" className="text-xl" />
											</div>
											<p className="text-xs text-default-500 font-medium">
												No trips yet. Start your journey!
											</p>
										</div>
									)}
								</div>
							</div>
						</SignedIn>

						<SignedOut>
							<div className="space-y-8 pb-4">
								<div className="text-center space-y-1 mt-2">
									<h1 className="text-3xl font-extrabold tracking-tight">
										Taxi<span className="text-primary">City</span>
									</h1>
									<p className="text-sm text-default-500 font-medium">
										The smarter way to commute in SA.
									</p>
								</div>

								<div className="grid grid-cols-2 gap-3">
									{[
										{ icon: "lucide:map-pin", label: "Live Tracking" },
										{ icon: "lucide:shield-check", label: "Verified Drivers" },
										{ icon: "lucide:tag", label: "Fixed Prices" },
										{ icon: "lucide:users", label: "Community Rated" },
									].map((feature, i) => (
										<div key={i} className="flex flex-col items-center justify-center p-4 rounded-xl bg-default-50 border border-default-100 gap-2 text-center hover:bg-default-100 transition-colors">
											<div className="p-2 rounded-full bg-background shadow-sm text-primary">
												<Icon icon={feature.icon} className="text-xl" />
											</div>
											<span className="text-xs font-semibold">{feature.label}</span>
										</div>
									))}
								</div>

								<div className="space-y-4">
									<SignInButton mode="modal">
										<Button
											className="w-full font-bold text-md shadow-lg shadow-primary/20"
											color="primary"
											size="lg"
											endContent={<Icon icon="lucide:arrow-right" />}
										>
											Get Started
										</Button>
									</SignInButton>

									<p className="text-[10px] text-center text-default-400 max-w-[250px] mx-auto leading-relaxed">
										By continuing, you agree to our Terms of Service and Privacy Policy.
									</p>
								</div>
							</div>
						</SignedOut>
					</div>
				</div>
			)}
		</div>
	);
}
