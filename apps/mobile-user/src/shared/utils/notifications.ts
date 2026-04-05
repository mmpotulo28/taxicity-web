import { router } from "expo-router";

export interface NotificationRoutePayload {
screen: "track" | "history";
tripId?: string;
}

export function routeFromNotification(payload: NotificationRoutePayload) {
if (payload.screen === "track") {
router.push({ pathname: "/(ride)/track", params: payload.tripId ? { tripId: payload.tripId } : undefined });
return;
}

router.push("/(tabs)/history");
}
