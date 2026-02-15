"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

interface RouteMapViewProps {
 readonly sourceRank: {
  lat: number;
  lng: number;
  name: string;
 };
 readonly destRank: {
  lat: number;
  lng: number;
  name: string;
 };
 readonly polyline?: string | null;
}

// Polyline component
const Polyline = ({ map, path }: { map: google.maps.Map; path: { lat: number; lng: number }[] }) => {
 useEffect(() => {
  if (!map || !path || path.length < 2) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMaps = (globalThis as any).google?.maps;
  if (!googleMaps) return;

  const polyline = new googleMaps.Polyline({
   path,
   strokeColor: "#4f46e5",
   strokeWeight: 5,
   strokeOpacity: 0.75,
   geodesic: true,
  });

  polyline.setMap(map);

  return () => {
   polyline.setMap(null);
  };
 }, [map, path]);

 return null;
};

export default function RouteMapView({ sourceRank, destRank, polyline }: RouteMapViewProps) {
 const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
 const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
 const [map, setMap] = useState<google.maps.Map | null>(null);
 const [decodedPath, setDecodedPath] = useState<{ lat: number; lng: number }[]>([]);

 // Decode polyline if provided
 useEffect(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMaps = (globalThis as any).google?.maps;

  if (!polyline || !googleMaps?.geometry) {
   // Fallback to straight line
   setDecodedPath([sourceRank, destRank]);
   return;
  }

  try {
   const path = googleMaps.geometry.encoding.decodePath(polyline);
   const decoded = path.map((p: google.maps.LatLng) => ({ lat: p.lat(), lng: p.lng() }));
   setDecodedPath(decoded);
  } catch (err) {
   console.error("Failed to decode polyline:", err);
   setDecodedPath([sourceRank, destRank]);
  }
 }, [polyline, sourceRank, destRank]);

 // Calculate center and zoom
 const center = {
  lat: (sourceRank.lat + destRank.lat) / 2,
  lng: (sourceRank.lng + destRank.lng) / 2,
 };

 // Fit bounds when map is loaded
 useEffect(() => {
  if (!map || decodedPath.length === 0) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMaps = (globalThis as any).google?.maps;
  if (!googleMaps) return;

  const bounds = new googleMaps.LatLngBounds();
  decodedPath.forEach((point) => {
   bounds.extend(point);
  });

  // Add padding
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (map as any).fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
 }, [map, decodedPath]);

 if (!apiKey) {
  return (
   <div className="flex items-center justify-center h-[400px] bg-default-100 rounded-lg">
    <p className="text-default-500">
     Map unavailable - Missing <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable
    </p>
   </div>
  );
 }

 return (
  <APIProvider apiKey={apiKey}>
   <Map
    {...({ mapId } as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultCenter={center}
    defaultZoom={12}
    style={{ width: "100%", height: "400px" }}
    gestureHandling="auto"
    disableDefaultUI={false}
    onLoad={(mapInstance) => setMap(mapInstance)}
   >
    {/* Route Line */}
    {map && decodedPath.length >= 2 && <Polyline map={map} path={decodedPath} />}

    {/* Source Rank Marker */}
    <AdvancedMarker position={sourceRank} title={`Source: ${sourceRank.name}`}>
     <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#22c55e"
      width="36"
      height="36"
      className="drop-shadow-lg"
     >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
     </svg>
    </AdvancedMarker>

    {/* Destination Rank Marker */}
    <AdvancedMarker position={destRank} title={`Destination: ${destRank.name}`}>
     <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#ef4444"
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
