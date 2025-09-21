"use client";
import { RouteSelector } from "@/components/route-selector";
import { useRide } from "@/context/RideContext";
import { useRouter } from "next/navigation";

const RouteSelection = () => {
	const router = useRouter();
	const { setSelectedRoute } = useRide();

	const onRouteSelect = (route: string) => {
		setSelectedRoute(route);
		router.push("/location");
	};

	return <RouteSelector onRouteSelect={onRouteSelect} />;
};

export default RouteSelection;
