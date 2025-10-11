"use client";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";

import { useRide } from "@/context/RideContext";
import TripCard from "@/components/TripCard";
import { MapView } from "@/components/map-view";
import AuthButton from "@/components/AuthButton";
import Header from "@/components/Header";

export default function Home() {
	const router = useRouter();
	const { tripHistory } = useRide();

	const onRequestRide = () => {
		router.push("/ride/route");
	};

	return (
		<div className="relative h-full">
			{/* Fullscreen map as background */}
			<MapView centerOnRank showTaxis fullscreen={true} zIndex={0} />

			<Header />

			{/* Overlay content */}
			<div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col">
				{/* Middle space for map viewing */}
				<div className="flex-1" />

				{/* Bottom content */}
				<div className="bg-background rounded-t-2xl p-4 space-y-4">
					<SignedIn>
						<Button
							className="w-full"
							color="primary"
							endContent={<Icon icon="lucide:arrow-right" />}
							size="lg"
							onPress={onRequestRide}>
							Request a Taxi
						</Button>

						<div className="flex gap-2 justify-between">
							<Button
								as={Link}
								className="flex-1"
								color="primary"
								href="/ride/trip/history"
								startContent={<Icon icon="lucide:clock" />}
								variant="flat">
								Trip History
							</Button>
							<Button
								as={Link}
								className="flex-1"
								color="primary"
								href="/settings"
								startContent={<Icon icon="lucide:settings" />}
								variant="flat">
								Settings
							</Button>
						</div>

						{/* Recent Trips */}
						<div>
							<h3 className="text-sm font-semibold mb-2">Recent Trips</h3>
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
								<p className="text-xs text-default-500">
									No recent trips yet. Book your first ride!
								</p>
							)}
						</div>
					</SignedIn>

					<SignedOut>
						<div className="text-center space-y-4">
							<AuthButton />
							<p className="text-sm text-default-500">
								Join thousands of satisfied passengers using TaxiCity for safe,
								reliable transportation across South Africa.
							</p>
							<div className="grid grid-cols-2 gap-4 text-center">
								<div className="bg-default-50 p-3 rounded-lg">
									<Icon
										className="text-2xl text-primary mx-auto mb-1"
										icon="lucide:shield-check"
									/>
									<p className="text-xs font-medium">Verified Drivers</p>
								</div>
								<div className="bg-default-50 p-3 rounded-lg">
									<Icon
										className="text-2xl text-primary mx-auto mb-1"
										icon="lucide:map-pin"
									/>
									<p className="text-xs font-medium">Live Tracking</p>
								</div>
							</div>
						</div>
					</SignedOut>
				</div>
			</div>
		</div>
	);
}
