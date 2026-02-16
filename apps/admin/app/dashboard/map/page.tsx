"use client";

import React from "react";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Icon } from "@iconify/react";
import LiveMap from "@/components/dashboard/LiveMap";

export default function OperationsMapPage() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold">Live Operations Map</h1>
					<Breadcrumbs>
						<BreadcrumbItem>Admin</BreadcrumbItem>
						<BreadcrumbItem>Operations</BreadcrumbItem>
						<BreadcrumbItem>Map View</BreadcrumbItem>
					</Breadcrumbs>
				</div>
			</div>

			<Card className="shadow-sm">
				<CardHeader className="flex gap-3 px-6 pt-6">
					<div className="p-2 bg-primary/10 rounded-lg">
						<Icon icon="lucide:map" className="text-xl text-primary" />
					</div>
					<div className="flex flex-col">
						<p className="text-md font-bold">Real-time Taxi Tracking</p>
						<p className="text-xs text-default-500">Monitoring all active vehicles in the fleet</p>
					</div>
				</CardHeader>
				<CardBody className="p-6">
					<LiveMap />
				</CardBody>
			</Card>
		</div>
	);
}
