"use client";
import { MapView } from "@/components/map-view";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	return (
		<MapView
			onRequestRide={() => {
				router.push("/route");
			}}
		/>
	);
}
