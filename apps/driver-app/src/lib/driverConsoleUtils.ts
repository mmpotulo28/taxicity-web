import type { RideStatusPayload } from "@taxiciti/utils";

export function formatCurrency(value: number) {
	return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 2 }).format(value);
}

const statusFlow: RideStatusPayload["status"][] = ["ACCEPTED", "ARRIVED_AT_PICKUP", "IN_PROGRESS", "COMPLETED"];

export function getNextStatus(current: string): RideStatusPayload["status"] | null {
	const index = statusFlow.indexOf(current as RideStatusPayload["status"]);
	if (index < 0 || index === statusFlow.length - 1) {
		return null;
	}
	return statusFlow[index + 1];
}
