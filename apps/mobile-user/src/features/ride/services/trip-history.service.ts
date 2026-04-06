import { apiClient } from "../../../core/api/client";
import type { TripHistoryItemDto, TripRatingPayloadDto } from "../dto/trip-history.dto";

interface RawDriver {
	fullName?: string;
	firstName?: string;
	lastName?: string;
}

interface RawTaxi {
	id?: string;
	make?: string;
	model?: string;
	licensePlate?: string;
	driver?: RawDriver;
}

interface RawRoute {
	name?: string;
}

interface RawTrip {
	id: string;
	status?: string;
	requestTime?: string;
	pickupAddress?: string;
	dropoffAddress?: string;
	fare?: number;
	paymentMethod?: string;
	taxiId?: string;
	taxi?: RawTaxi;
	route?: RawRoute;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function pickTripArray(payload: unknown): RawTrip[] {
	if (!isRecord(payload)) {
		return [];
	}

	if (Array.isArray(payload.trips)) {
		return payload.trips as RawTrip[];
	}
	if (Array.isArray(payload.data)) {
		return payload.data as RawTrip[];
	}
	if (isRecord(payload.data) && Array.isArray(payload.data.trips)) {
		return payload.data.trips as RawTrip[];
	}
	return [];
}

function mapTrip(raw: RawTrip): TripHistoryItemDto {
	const requestDate = raw.requestTime ? new Date(raw.requestTime) : new Date();
	const driver =
		raw.taxi?.driver?.fullName ||
		`${raw.taxi?.driver?.firstName || ""} ${raw.taxi?.driver?.lastName || ""}`.trim() ||
		"Pending Assignment";
	const vehicle =
		raw.taxi?.make && raw.taxi?.model
			? `${raw.taxi.make} ${raw.taxi.model}`
			: raw.taxi?.model || "Pending Assignment";

	return {
		id: raw.id,
		route: raw.route?.name || "Unknown Route",
		date: requestDate.toISOString().split("T")[0],
		time: requestDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
		pickup: raw.pickupAddress || "Unknown Pickup",
		dropoff: raw.dropoffAddress || "Unknown Dropoff",
		driver,
		vehicle,
		licensePlate: raw.taxi?.licensePlate || "Pending Assignment",
		fare: `R${raw.fare || 0}`,
		status: (raw.status || "requested").toLowerCase(),
		paymentMethod: raw.paymentMethod === "QR_CODE" ? "QR Code" : "Cash",
		taxiId: raw.taxiId || raw.taxi?.id,
	};
}

export async function getTripHistory(): Promise<TripHistoryItemDto[]> {
	const payload = await apiClient.get<unknown>("/api/user/trips");
	return pickTripArray(payload).map(mapTrip);
}

export async function getTripById(tripId: string): Promise<TripHistoryItemDto | null> {
	const history = await getTripHistory();
	return history.find((trip) => trip.id === tripId) || null;
}

export async function submitTripRating(tripId: string, payload: TripRatingPayloadDto): Promise<void> {
	await apiClient.post<unknown, TripRatingPayloadDto>(`/api/user/trips/${tripId}/rating`, payload);
}
