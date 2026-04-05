"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { apiGet, apiPost } from "@/lib/api-client";

interface Route {
	id: string;
	name: string;
	description: string;
}

interface RouteSelectionProps {
	taxiId: string;
	onComplete: () => void;
}

export const RouteSelection: React.FC<RouteSelectionProps> = ({ taxiId, onComplete }) => {
	const [loading, setLoading] = useState(false);
	const [routes, setRoutes] = useState<Route[]>([]);
	const [selectedRoute, setSelectedRoute] = useState("");

	useEffect(() => {
		const fetchRoutes = async () => {
			try {
				const data = await apiGet<{ routes?: Route[] }>("/api/routes");
				setRoutes(data.routes || []);
			} catch (error) {
				console.error(error);
				addToast({
					title: "Error",
					description: "Failed to load routes",
					color: "danger",
				});
			}
		};
		fetchRoutes();
	}, []);

	const handleSubmit = async () => {
		if (!selectedRoute) return;
		setLoading(true);
		try {
			await apiPost("/api/driver/routes/assign", {
				taxiId,
				routeId: selectedRoute,
			});
			addToast({
				title: "Success",
				description: "Route assigned successfully",
				color: "success",
			});
			onComplete();
		} catch (error) {
			console.error(error);
			addToast({
				title: "Error",
				description: "Failed to assign route",
				color: "danger",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className='w-full max-w-md mx-auto mt-10'>
			<CardHeader className='flex flex-col gap-2'>
				<h1 className='text-2xl font-bold'>Select Your Route</h1>
				<p className='text-default-500'>Choose the route you will be operating on today.</p>
			</CardHeader>
			<CardBody className='flex flex-col gap-4'>
				<Select label='Select Route' placeholder='Choose a route' selectedKeys={selectedRoute ? [selectedRoute] : []} onChange={(e) => setSelectedRoute(e.target.value)}>
					{routes.map((route) => (
						<SelectItem key={route.id}>{route.name}</SelectItem>
					))}
				</Select>
				<Button color='primary' onClick={handleSubmit} isLoading={loading} isDisabled={!selectedRoute}>
					Start Driving
				</Button>
			</CardBody>
		</Card>
	);
};
