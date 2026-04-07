
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Card, CardBody } from "heroui-native/card";
import { Button } from "heroui-native/button";
import { Select, SelectItem } from "heroui-native/select";
import { Feather } from "@expo/vector-icons";
import { addToast } from "heroui-native/toast";
import { Spinner } from "heroui-native/spinner";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { usePusher } from "@taxiciti/ui";
import { EVENTS } from "@taxiciti/utils";
import type { WsAck } from "@taxiciti/utils";
import { apiGet } from "@/lib/api-client";

interface Route {
	id: string;
	name: string;
}

interface Rank {
	id: string;
	name: string;
	address: string;
	lat?: number;
	lng?: number;
	sourceRoutes?: Route[];
}

interface UserLocation {
	lat: number;
	lng: number;
}

interface RankQueueProps {
	taxiId?: string; // Driver needs to select a vehicle to join queue
	currentLocation: UserLocation | null;
	onJoin?: () => void;
	onLeave?: () => void;
	onStatusChange?: (inQueue: boolean, position?: number) => void;
	onStartTrip?: (routeId: string) => void;
}

export function RankQueue({ taxiId, currentLocation, onJoin, onLeave, onStatusChange, onStartTrip }: RankQueueProps) {
	const { pusher } = usePusher();
	const [ranks, setRanks] = useState<Rank[]>([]);
	const [selectedRank, setSelectedRank] = useState("");
	const [selectedRoute, setSelectedRoute] = useState("");
	const [queueStatus, setQueueStatus] = useState<{ inQueue: boolean; rank?: Rank; position?: number; queueLength?: number; joinedAt?: string } | null>(null);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(false);

	const emitWithAck = React.useCallback(
		<TResponse,>(event: string, payload: unknown) =>
			new Promise<TResponse>((resolve, reject) => {
				if (!pusher) {
					reject(new Error("Realtime socket is not connected"));
					return;
				}

				pusher.emit(event, payload, (response: WsAck<TResponse>) => {
					if (response?.success) {
						resolve(response.data as TResponse);
						return;
					}

					reject(new Error(response?.message ?? "Realtime operation failed"));
				});
			}),
		[pusher],
	);

	const fetchRanks = React.useCallback(async () => {
		// In real app, pass lat/lng to filter nearby
		try {
			const data = await apiGet<{ ranks?: Rank[] }>("/api/driver/ranks?limit=50");

			// The API returns { ranks: [], pagination: {} }
			const ranksArray = data.ranks || [];

			// If we have location, sort by distance locally for now
			let sorted = ranksArray;
			if (currentLocation && Array.isArray(ranksArray)) {
				sorted = [...ranksArray].sort((a: Rank, b: Rank) => {
					if (!a.lat || !a.lng || !b.lat || !b.lng) return 0;
					const da = Math.hypot(a.lat - currentLocation.lat, a.lng - currentLocation.lng);
					const db = Math.hypot(b.lat - currentLocation.lat, b.lng - currentLocation.lng);
					return da - db;
				});
			}
			setRanks(sorted);
		} catch (e) {
			console.error("Failed to fetch ranks", e);
			setRanks([]);
		}
	}, [currentLocation]);

	const fetchStatus = React.useCallback(async () => {
		try {
			const data = await emitWithAck<{ inQueue: boolean; rank?: Rank; position?: number; queueLength?: number; joinedAt?: string }>(EVENTS.DRIVER_QUEUE_STATUS_SYNC, {});
			setQueueStatus(data);
			if (onStatusChange) {
				onStatusChange(!!data.inQueue, data.position);
			}
		} catch (error) {
			console.error("Failed to fetch queue status", error);
		} finally {
			setLoading(false);
		}
	}, [emitWithAck, onStatusChange]);

	// Fetch status on mount
	useEffect(() => {
		fetchStatus();
		fetchRanks();
	}, [fetchRanks, fetchStatus]);

	const handleJoin = async () => {
		if (!taxiId) {
			addToast({ title: "Vehicle Required", description: "Please select a vehicle above first.", color: "warning" });
			return;
		}
		setProcessing(true);
		try {
			const data = await emitWithAck<{ position?: number }>(EVENTS.DRIVER_QUEUE_JOIN, { rankId: selectedRank, taxiId });

			await fetchStatus();
			addToast({ title: "Joined Queue", description: `You are #${data.position} in line.`, color: "success" });
			onJoin?.();
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "An error occurred";
			addToast({ title: "Error", description: msg, color: "danger" });
		} finally {
			setProcessing(false);
		}
	};

	const handleLeave = async () => {
		if (!confirm("Are you sure you want to leave the queue? You will lose your spot.")) return;

		setProcessing(true);
		try {
			await emitWithAck(EVENTS.DRIVER_QUEUE_LEAVE, {});

			setQueueStatus({ inQueue: false });
			setSelectedRank("");
			addToast({ title: "Left Queue", description: "You have left the rank queue.", color: "default" });
			onLeave?.();
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "An error occurred";
			addToast({ title: "Error", description: msg, color: "danger" });
		} finally {
			setProcessing(false);
		}
	};

	if (loading)
		return (
			<View className='py-8 flex justify-center'>
				<Spinner label='Checking queue status...' />
			</View>
		);

	// VIEW: In Queue
	if (queueStatus?.inQueue && queueStatus.rank) {
		return (
			<Card className='bg-primary-50 border-primary border shadow-md mb-6'>
				<CardBody className='p-6'>
					<View className='flex justify-between items-start'>
						<View>
							<Text className='text-sm font-bold text-primary uppercase tracking-wider mb-1'>Current Queue</Text>
							<Text className='text-xl font-bold text-default-900'>{queueStatus.rank.name}</Text>
							<Text className='text-xs text-default-500'>Joined at {queueStatus.joinedAt ? new Date(queueStatus.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</Text>
						</View>
						<View className='text-right'>
							<Text className='text-xs text-default-500 uppercase'>Position</Text>
							<Text className='text-4xl font-black text-primary'>{queueStatus.position}</Text>
							<Text className='text-xs text-default-400'>of {queueStatus.queueLength}</Text>
						</View>
					</View>

					<View className='mt-6 flex gap-3'>
						<Button className='flex-1 bg-white text-danger border border-danger/20 font-medium' variant='secondary' onPress={handleLeave} isLoading={processing}>
							Leave Queue
						</Button>
					</View>

					{queueStatus.position === 1 && (
						<View className='mt-4 space-y-3'>
							<Animated.View initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='p-3 bg-success-100 text-success-700 rounded-lg text-sm font-medium flex gap-2 items-center'>
								<Feather name="solar:bell-bing-bold" width={20} />
								<Text>It&apos;s your turn! Please move to the loading bay.</Text>
							</Animated.View>

							{queueStatus.rank?.sourceRoutes && queueStatus.rank.sourceRoutes.length > 0 && (
								<View className='bg-white p-4 rounded-lg border border-default-200 shadow-sm space-y-3'>
									<Text className='text-sm font-semibold text-default-700'>Ready to Load Passengers?</Text>
									<Select label='Select Route' placeholder='Where are you heading?' selectedKeys={selectedRoute ? [selectedRoute] : []} onChange={(e) => setSelectedRoute(e.target.value)} size='sm' variant='bordered'>
										{queueStatus.rank.sourceRoutes.map((route) => (
											<SelectItem key={route.id} textValue={route.name}>
												{route.name}
											</SelectItem>
										))}
									</Select>
									<Button fullWidth variant='primary' className='font-bold shadow-lg shadow-primary/20' isDisabled={!selectedRoute} onPress={() => onStartTrip?.(selectedRoute)} >
<Feather name="arrow-right" />
										Start Loading
									</Button>
								</View>
							)}
						</View>
					)}
				</CardBody>
			</Card>
		);
	}

	// VIEW: Join Queue Form
	return (
		<View className='mb-6'>
			<View className='flex items-center gap-2 mb-3'>
				<Feather name="solar:users-group-rounded-bold" className='text-default-500' width={20} />
				<Text className='font-semibold text-default-700'>Digital Rank Queue</Text>
			</View>

			<View className='flex gap-2'>
				<Select placeholder='Select nearby rank to join...' className='flex-1' selectedKeys={selectedRank ? [selectedRank] : []} onChange={(e) => setSelectedRank(e.target.value)} isLoading={ranks.length === 0}>
					{ranks.map((r) => (
						<SelectItem key={r.id} textValue={r.name}>
							<View className='flex flex-col'>
								<Text className='text-sm font-medium'>{r.name}</Text>
								<Text className='text-tiny text-default-400'>{r.address}</Text>
							</View>
						</SelectItem>
					))}
				</Select>
				<Button variant='primary' isDisabled={!selectedRank || !taxiId} isLoading={processing} onPress={handleJoin} className='font-semibold'>
					Join Queue
				</Button>
			</View>
			{!taxiId && <Text className='text-tiny text-warning mt-1 ml-1'>Please select your vehicle below to join a queue.</Text>}
		</View>
	);
}
