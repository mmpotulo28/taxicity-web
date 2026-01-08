// css declarations
declare module "*.css" {
	const content: { [className: string]: string };
	export default content;
}

// Declare Google Maps namespace
declare namespace google {
	namespace maps {
		class Map {
			constructor(mapDiv: Element, opts?: MapOptions);
			// Add commonly used methods
			setCenter(latLng: LatLng | LatLngLiteral): void;
			setZoom(zoom: number): void;
			getCenter(): LatLng;
			getZoom(): number;
			panTo(latLng: LatLng | LatLngLiteral): void;
		}

		class Marker {
			constructor(opts?: MarkerOptions);
			setPosition(latLng: LatLng | LatLngLiteral): void;
			setMap(map: Map | null): void;
			addListener(eventName: string, handler: Function): MapsEventListener;
			getPosition(): LatLng;
		}

		class InfoWindow {
			constructor(opts?: InfoWindowOptions);
			open(map: Map | null, anchor?: Marker): void;
			close(): void;
			setContent(content: string | Node): void;
		}

		class LatLng {
			constructor(lat: number, lng: number, noWrap?: boolean);
			lat(): number;
			lng(): number;
		}

		class Size {
			constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
			width: number;
			height: number;
		}

		interface MapOptions {
			center?: LatLng | LatLngLiteral;
			zoom?: number;
			mapTypeId?: string;
			mapTypeControl?: boolean;
			streetViewControl?: boolean;
			fullscreenControl?: boolean;
			zoomControl?: boolean;
		}

		interface MarkerOptions {
			position?: LatLng | LatLngLiteral;
			map?: Map | null;
			title?: string;
			icon?: string | Icon;
			label?: string | MarkerLabel;
			draggable?: boolean;
		}

		interface Icon {
			url: string;
			size?: Size;
			scaledSize?: Size;
		}

		interface MarkerLabel {
			text: string;
			color?: string;
			fontWeight?: string;
			fontSize?: string;
		}

		interface InfoWindowOptions {
			content?: string | Node;
			maxWidth?: number;
			position?: LatLng | LatLngLiteral;
		}

		interface LatLngLiteral {
			lat: number;
			lng: number;
		}

		interface MapsEventListener {
			remove(): void;
		}
	}
}

// Extend Window and globalThis interfaces
interface Window {
	google: typeof google;
}

interface globalThis {
	google: typeof google;
}
