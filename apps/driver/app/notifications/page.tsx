"use client";

import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Bell, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface Notification {
	id: string;
	type: "INFO" | "WARNING" | "SUCCESS" | "ERROR" | "TRIP_UPDATE" | "PAYMENT";
	title: string;
	message: string;
	read: boolean;
	createdAt: string;
}

export default function DriverNotificationsPage() {
	const { notifications, isLoading: loading, markAsRead } = useNotifications();

	const getIcon = (type: string) => {
		switch (type) {
			case "WARNING":
				return <AlertTriangle className='text-warning' size={24} />;
			case "SUCCESS":
				return <CheckCircle className='text-success' size={24} />;
			case "ERROR":
				return <AlertTriangle className='text-danger' size={24} />;
			default:
				return <Info className='text-primary' size={24} />;
		}
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-[50vh]'>
				<Spinner size='lg' />
			</div>
		);
	}

	return (
		<div className='p-4 pb-24 space-y-4'>
			<h1 className='text-2xl font-bold mb-4'>Notifications</h1>

			{notifications.length === 0 ? (
				<div className='text-center py-10 text-default-500'>
					<Bell className='mx-auto mb-2 opacity-20' size={48} />
					<p>No notifications yet</p>
				</div>
			) : (
				notifications.map((notification: Notification) => (
					<Card key={notification.id} className={`w-full ${notification.read ? "opacity-60" : "border-l-4 border-primary"}`}>
						<CardBody className='flex flex-row gap-4 items-start'>
							<div className='mt-1'>{getIcon(notification.type)}</div>
							<div className='flex-1'>
								<div className='flex justify-between items-start'>
									<h3 className={`font-semibold ${notification.read ? "text-default-600" : "text-default-900"}`}>{notification.title}</h3>
									<span className='text-xs text-default-400 whitespace-nowrap ml-2'>{new Date(notification.createdAt).toLocaleDateString()}</span>
								</div>
								<p className='text-sm text-default-600 mt-1'>{notification.message}</p>
								{!notification.read && (
									<Button size='sm' variant='light' color='primary' className='mt-2 px-0 h-8 min-w-0' onPress={() => markAsRead(notification.id)}>
										Mark as read
									</Button>
								)}
							</div>
						</CardBody>
					</Card>
				))
			)}
		</div>
	);
}
