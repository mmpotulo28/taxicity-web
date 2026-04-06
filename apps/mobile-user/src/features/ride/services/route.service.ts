import { apiClient } from "../../../core/api/client";
import type { RouteDto } from "../dto/ride-funnel.dto";

interface RoutesResponseDto {
	routes: RouteDto[];
}

interface RawRoute {
id: string;
name: string;
estimatedFare: string;
rankId: string;
}

interface RawRoutesPayload {
data?: RawRoute[];
}

function mapRawRoute(raw: RawRoute): RouteDto {
return {
id: raw.id,
name: raw.name,
estimatedFare: raw.estimatedFare,
rankId: raw.rankId,
};
}

export async function getRoutes(): Promise<RoutesResponseDto> {
const payload = await apiClient.get<RawRoutesPayload>("/api/user/routes");
return {
routes: (payload.data ?? []).map(mapRawRoute),
};
}
