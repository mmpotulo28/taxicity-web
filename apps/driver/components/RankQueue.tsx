"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";
import { motion } from "framer-motion";
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
			const data = await apiGet<{ ranks?: Rank[] }>("/api/ranks?limit=50");

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
			<div className='py-8 flex justify-center'>
				<Spinner label='Checking queue status...' />
			</div>
		);

	// VIEW: In Queue
	if (queueStatus?.inQueue && queueStatus.rank) {
		return (
			<Card className='bg-primary-50 border-primary border shadow-md mb-6'>
				<CardBody className='p-6'>
					<div className='flex justify-between items-start'>
						<div>
							<h3 className='text-sm font-bold text-primary uppercase tracking-wider mb-1'>Current Queue</h3>
							<h2 className='text-xl font-bold text-default-900'>{queueStatus.rank.name}</h2>
							<p className='text-xs text-default-500'>Joined at {queueStatus.joinedAt ? new Date(queueStatus.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</p>
						</div>
						<div className='text-right'>
							<p className='text-xs text-default-500 uppercase'>Position</p>
							<p className='text-4xl font-black text-primary'>{queueStatus.position}</p>
							<p className='text-xs text-default-400'>of {queueStatus.queueLength}</p>
						</div>
					</div>

					<div className='mt-6 flex gap-3'>
						<Button className='flex-1 bg-white text-danger border border-danger/20 font-medium' variant='flat' onPress={handleLeave} isLoading={processing}>
							Leave Queue
						</Button>
					</div>

					{queueStatus.position === 1 && (
						<div className='mt-4 space-y-3'>
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='p-3 bg-success-100 text-success-700 rounded-lg text-sm font-medium flex gap-2 items-center'>
								<Icon icon='solar:bell-bing-bold' width={20} />
								<span>It&apos;s your turn! Please move to the loading bay.</span>
							</motion.div>

							{queueStatus.rank?.sourceRoutes && queueStatus.rank.sourceRoutes.length > 0 && (
								<div className='bg-white p-4 rounded-lg border border-default-200 shadow-sm space-y-3'>
									<p className='text-sm font-semibold text-default-700'>Ready to Load Passengers?</p>
									<Select label='Select Route' placeholder='Where are you heading?' selectedKeys={selectedRoute ? [selectedRoute] : []} onChange={(e) => setSelectedRoute(e.target.value)} size='sm' variant='bordered'>
										{queueStatus.rank.sourceRoutes.map((route) => (
											<SelectItem key={route.id} textValue={route.name}>
												{route.name}
											</SelectItem>
										))}
									</Select>
									<Button fullWidth color='primary' className='font-bold shadow-lg shadow-primary/20' isDisabled={!selectedRoute} onPress={() => onStartTrip?.(selectedRoute)} endContent={<Icon icon='lucide:arrow-right' />}>
										Start Loading
									</Button>
								</div>
							)}
						</div>
					)}
				</CardBody>
			</Card>
		);
	}

	// VIEW: Join Queue Form
	return (
		<div className='mb-6'>
			<div className='flex items-center gap-2 mb-3'>
				<Icon icon='solar:users-group-rounded-bold' className='text-default-500' width={20} />
				<h3 className='font-semibold text-default-700'>Digital Rank Queue</h3>
			</div>

			<div className='flex gap-2'>
				<Select placeholder='Select nearby rank to join...' className='flex-1' selectedKeys={selectedRank ? [selectedRank] : []} onChange={(e) => setSelectedRank(e.target.value)} isLoading={ranks.length === 0}>
					{ranks.map((r) => (
						<SelectItem key={r.id} textValue={r.name}>
							<div className='flex flex-col'>
								<span className='text-sm font-medium'>{r.name}</span>
								<span className='text-tiny text-default-400'>{r.address}</span>
							</div>
						</SelectItem>
					))}
				</Select>
				<Button color='primary' isDisabled={!selectedRank || !taxiId} isLoading={processing} onPress={handleJoin} className='font-semibold'>
					Join Queue
				</Button>
			</div>
			{!taxiId && <p className='text-tiny text-warning mt-1 ml-1'>Please select your vehicle below to join a queue.</p>}
		</div>
	);
}
