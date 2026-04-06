import { apiClient } from "../../../core/api/client";
import type { RankDto, RideRequestDto, RideRequestResponseDto, RouteDto, TaxiDto } from "../dto/ride-funnel.dto";

interface RawRoute {
	id: string;
	name: string;
	sourceRankId?: string;
	rankId?: string;
	baseFare?: number;
	estimatedFare?: string;
}

interface RawRank {
	id: string;
	name: string;
	address: string;
	region: string;
	lat: number;
	lng: number;
}

interface RawTaxi {
	id: string;
	licensePlate: string;
	status: string;
	routes?: Array<{ routeId?: string }>;
	make?: string;
	model?: string;
	driver?: {
		fullName?: string;
		firstName?: string;
		lastName?: string;
	};
}

interface ApiEnvelope<T> {
	data?: T;
	routes?: T extends Array<RawRoute> ? T : never;
	ranks?: T extends Array<RawRank> ? T : never;
	taxis?: T extends Array<RawTaxi> ? T : never;
	trip?: RideRequestResponseDto;
}

function pickArray<T>(payload: unknown, keys: string[]): T[] {
	if (typeof payload !== "object" || payload === null) {
		return [];
	}
	const record = payload as Record<string, unknown>;
	for (const key of keys) {
		const value = record[key];
		if (Array.isArray(value)) {
			return value as T[];
		}
	}
	if (typeof record.data === "object" && record.data !== null) {
		const nested = record.data as Record<string, unknown>;
		for (const key of keys) {
			const value = nested[key];
			if (Array.isArray(value)) {
				return value as T[];
			}
		}
	}
	return [];
}

function mapRoute(raw: RawRoute): RouteDto {
	return {
		id: raw.id,
		name: raw.name,
		estimatedFare: raw.estimatedFare || `R${raw.baseFare || 0}`,
		rankId: raw.sourceRankId || raw.rankId || "",
	};
}

function mapRank(raw: RawRank): RankDto {
	return {
		id: raw.id,
		name: raw.name,
		address: raw.address,
		region: raw.region,
		coordinates: { lat: raw.lat, lng: raw.lng },
	};
}

function mapTaxi(raw: RawTaxi): TaxiDto {
	return {
		id: raw.id,
		driver: raw.driver?.fullName || `${raw.driver?.firstName || ""} ${raw.driver?.lastName || ""}`.trim() || "Unknown",
		model: raw.make && raw.model ? `${raw.make} ${raw.model}` : raw.model || "Unknown",
		licensePlate: raw.licensePlate,
		status: raw.status,
		routeId: raw.routes?.[0]?.routeId,
	};
}

export async function getRideRoutes(): Promise<RouteDto[]> {
	const payload = await apiClient.get<ApiEnvelope<RawRoute[]>>("/api/user/routes");
	return pickArray<RawRoute>(payload, ["routes"]).map(mapRoute);
}

export async function getRideRanks(): Promise<RankDto[]> {
	const payload = await apiClient.get<ApiEnvelope<RawRank[]>>("/api/user/ranks");
	return pickArray<RawRank>(payload, ["ranks"]).map(mapRank);
}

export async function getRideTaxis(): Promise<TaxiDto[]> {
	const payload = await apiClient.get<ApiEnvelope<RawTaxi[]>>("/api/user/taxis");
	return pickArray<RawTaxi>(payload, ["taxis"]).map(mapTaxi);
}

export async function requestRide(payload: RideRequestDto): Promise<RideRequestResponseDto> {
	const response = await apiClient.post<ApiEnvelope<never>, RideRequestDto>("/api/user/trips", payload);
	return response.trip || {
		id: "",
		status: "requested",
		requestTime: new Date().toISOString(),
	};
}
