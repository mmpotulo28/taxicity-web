"use client";

import React from "react";
import { Icon } from "@iconify/react";

interface TripReceiptProps {
	trip: {
		id: string;
		requestTime: string;
		pickupAddress: string;
		dropoffAddress: string;
		fare: number;
		platformFee: number | null;
		paymentMethod: string;
		paymentStatus: string;
		route: {
			name: string;
		};
		vehicleTrip?: {
			driver: {
				fullName: string | null;
				firstName: string;
				lastName: string;
			};
			taxi: {
				model: string;
				licensePlate: string;
			};
		} | null;
	};
}

export const TripReceipt = ({ trip }: TripReceiptProps) => {
	const totalAmount = trip.fare + (trip.platformFee || 0);
	const date = new Date(trip.requestTime).toLocaleDateString("en-ZA", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
	const time = new Date(trip.requestTime).toLocaleTimeString("en-ZA", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div
			id={`receipt-${trip.id}`}
			className="p-12 w-[800px] font-sans"
			style={{
				minHeight: "1000px",
				backgroundColor: '#ffffff',
				color: '#18181b'
			}}
		>
			{/* Brand Header */}
			<div className="flex justify-between items-start mb-12">
				<div className="flex items-center gap-3">
					<div
						className="w-12 h-12 rounded-xl flex items-center justify-center"
						style={{ backgroundColor: '#006FEE' }}
					>
						<Icon icon="lucide:taxi" style={{ color: '#ffffff', fontSize: '30px' }} />
					</div>
					<div>
						<h1 className="text-3xl font-black tracking-tight" style={{ color: '#006FEE' }}>TAXICITY</h1>
						<p className="text-sm font-medium uppercase tracking-widest" style={{ color: '#71717a' }}>Official Receipt</p>
					</div>
				</div>
				<div className="text-right">
					<p className="text-sm font-bold" style={{ color: '#a1a1aa' }}>RECEIPT NO.</p>
					<p className="text-lg font-mono font-bold">#{trip.id.slice(0, 8).toUpperCase()}</p>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-12 mb-12">
				<div>
					<p className="text-xs font-bold uppercase mb-2" style={{ color: '#a1a1aa' }}>Issue Date</p>
					<p className="text-base font-semibold">{date}</p>
					<p className="text-sm" style={{ color: '#71717a' }}>{time}</p>
				</div>
				<div className="text-right">
					<p className="text-xs font-bold uppercase mb-2" style={{ color: '#a1a1aa' }}>Payment Mode</p>
					<div className="flex items-center justify-end gap-2">
						<Icon icon={trip.paymentMethod === "CASH" ? "lucide:banknote" : "lucide:credit-card"} style={{ color: '#52525b' }} />
						<p className="text-base font-semibold">{trip.paymentMethod}</p>
					</div>
					<p
						className="text-sm font-bold"
						style={{ color: trip.paymentStatus === "PAID" ? "#17C964" : "#F5A524" }}
					>
						{trip.paymentStatus}
					</p>
				</div>
			</div>

			<div className="my-8 h-[1px] w-full" style={{ backgroundColor: '#f4f4f5' }} />

			{/* Trip Locations */}
			<div className="space-y-6 mb-12">
				<div className="flex gap-4">
					<div className="flex flex-col items-center py-1">
						<div
							className="w-3 h-3 rounded-full border-2"
							style={{ borderColor: '#006FEE', backgroundColor: '#ffffff' }}
						/>
						<div className="w-0.5 flex-1 my-1" style={{ backgroundColor: '#e4e4e7' }} />
					</div>
					<div>
						<p className="text-xs font-bold uppercase mb-1" style={{ color: '#a1a1aa' }}>Pickup</p>
						<p className="text-base font-medium">{trip.pickupAddress}</p>
					</div>
				</div>
				<div className="flex gap-4">
					<div className="flex flex-col items-center py-1">
						<div
							className="w-3 h-3 rounded-sm"
							style={{ backgroundColor: '#006FEE' }}
						/>
					</div>
					<div>
						<p className="text-xs font-bold uppercase mb-1" style={{ color: '#a1a1aa' }}>Dropoff</p>
						<p className="text-base font-medium">{trip.dropoffAddress}</p>
					</div>
				</div>
			</div>

			{/* Details Section */}
			<div className="grid grid-cols-2 gap-12 mb-12 py-8 px-6 rounded-2xl" style={{ backgroundColor: '#fafafa' }}>
				<div>
					<p className="text-xs font-bold uppercase mb-3" style={{ color: '#a1a1aa' }}>Service Details</p>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-sm" style={{ color: '#71717a' }}>Route</span>
							<span className="text-sm font-semibold">{trip.route.name}</span>
						</div>
						{trip.vehicleTrip && (
							<>
								<div className="flex justify-between">
									<span className="text-sm" style={{ color: '#71717a' }}>Driver</span>
									<span className="text-sm font-semibold">{trip.vehicleTrip.driver.fullName || `${trip.vehicleTrip.driver.firstName} ${trip.vehicleTrip.driver.lastName}`}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm" style={{ color: '#71717a' }}>Vehicle</span>
									<span className="text-sm font-semibold">{trip.vehicleTrip.taxi.model} ({trip.vehicleTrip.taxi.licensePlate})</span>
								</div>
							</>
						)}
					</div>
				</div>
				<div>
					<p className="text-xs font-bold uppercase mb-3" style={{ color: '#a1a1aa' }}>Fare Breakdown</p>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-sm" style={{ color: '#71717a' }}>Base Fare</span>
							<span className="text-sm font-semibold">R{trip.fare.toFixed(2)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm" style={{ color: '#71717a' }}>Service Fee</span>
							<span className="text-sm font-semibold">R{(trip.platformFee || 0).toFixed(2)}</span>
						</div>
						<div
							className="my-2 h-[1px] w-full"
							style={{ borderTop: '1px dashed #d4d4d8' }}
						/>
						<div className="flex justify-between items-center pt-1">
							<span className="text-lg font-bold" style={{ color: '#18181b' }}>Total Paid</span>
							<span className="text-2xl font-black" style={{ color: '#006FEE' }}>R{totalAmount.toFixed(2)}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="mt-auto pt-12 text-center">
				<div className="inline-block p-4 rounded-xl mb-6" style={{ backgroundColor: '#fafafa' }}>
					<Icon icon="lucide:qr-code" style={{ color: '#d4d4d8', fontSize: '48px' }} />
				</div>
				<p className="text-sm font-medium" style={{ color: '#71717a' }}>Thank you for traveling with TaxiCity</p>
				<p className="text-xs mt-2" style={{ color: '#a1a1aa' }}>This is a system-generated receipt and does not require a signature.</p>
				<div className="flex justify-center gap-6 mt-8 text-xs font-bold uppercase tracking-widest" style={{ color: '#d4d4d8' }}>
					<span>www.taxicity.co.za</span>
					<span>•</span>
					<span>Support: 0800-TAXICITY</span>
				</div>
			</div>
		</div>
	);
};
