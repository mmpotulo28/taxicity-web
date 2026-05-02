"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

interface RankMapViewProps {
 readonly lat: number;
 readonly lng: number;
 readonly name: string;
}

export default function RankMapView({ lat, lng, name }: RankMapViewProps) {
 const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
 const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

 if (!apiKey) {
  return (
   <div className="flex items-center justify-center h-[400px] bg-default-100 rounded-lg">
    <p className="text-default-500">
     Map unavailable - Missing <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable
    </p>
   </div>
  );
 }

 const position = { lat, lng };

 return (
  <APIProvider apiKey={apiKey}>
   <Map
    {...({ mapId } as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultCenter={position}
    defaultZoom={15}
    style={{ width: "100%", height: "400px" }}
    gestureHandling="auto"
    disableDefaultUI={false}
   >
    <AdvancedMarker position={position} title={name}>
     <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#0070f3"
      width="36"
      height="36"
      className="drop-shadow-lg"
     >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
     </svg>
    </AdvancedMarker>
   </Map>
  </APIProvider>
 );
}

