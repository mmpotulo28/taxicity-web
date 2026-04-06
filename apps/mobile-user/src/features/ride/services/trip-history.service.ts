import { apiClient } from "../../../core/api/client";
import { isRecord } from "@taxiciti/utils";
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

interface RawPagination {
	page?: number;
	limit?: number;
	total?: number;
	pages?: number;
}

interface RawTripsListPayload {
	trips?: RawTrip[];
	data?: RawTrip[] | { trips?: RawTrip[] };
	pagination?: RawPagination;
}

function isRawTrip(value: unknown): value is RawTrip {
	return isRecord(value) && typeof value.id === "string";
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
	const payload = await apiClient.get<RawTripsListPayload>("/api/user/trips");
	return pickTripArray(payload).map(mapTrip);
}

export async function getTripById(tripId: string): Promise<TripHistoryItemDto | null> {
	const payload = await apiClient.get<unknown>(`/api/user/trips/${tripId}`);
	if (!isRecord(payload)) {
		return null;
	}
	if ("id" in payload && typeof payload.id === "string") {
		return isRawTrip(payload) ? mapTrip(payload) : null;
	}
	if (isRecord(payload.data) && "id" in payload.data && typeof payload.data.id === "string") {
		return isRawTrip(payload.data) ? mapTrip(payload.data) : null;
	}
	return null;
}

export async function submitTripRating(tripId: string, payload: TripRatingPayloadDto): Promise<void> {
	await apiClient.post<unknown, TripRatingPayloadDto>(`/api/user/trips/${tripId}/rating`, payload);
}
