import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

import { useMap } from "@/context/MapContext";

const MapSelectionOverlay: React.FC = () => {
	const { selectionMode, setSelectionMode } = useMap();

	if (!selectionMode) return null;

	return (
		<div className="absolute top-0 left-0 right-0 z-10 p-4 bg-background/80 backdrop-blur-sm">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div
						className={`w-8 h-8 rounded-full ${selectionMode === "pickup" ? "bg-primary/10" : "bg-danger/10"} flex items-center justify-center`}>
						<div
							className={`w-3 h-3 rounded-full ${selectionMode === "pickup" ? "bg-primary" : "bg-danger"}`}
						/>
					</div>
					<span className="font-medium">
						Select {selectionMode === "pickup" ? "pickup" : "drop-off"} location
					</span>
				</div>
				<Button
					isIconOnly
					aria-label="Cancel selection"
					color="danger"
					size="sm"
					variant="light"
					onPress={() => setSelectionMode(null)}>
					<Icon icon="lucide:x" />
				</Button>
			</div>
		</div>
	);
};

export default MapSelectionOverlay;
