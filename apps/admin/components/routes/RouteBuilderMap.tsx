"use client";

import React, { useEffect, useState } from "react";
import {
 APIProvider,
 Map,
 useMapsLibrary,
 useMap,
} from "@vis.gl/react-google-maps";

interface RouteBuilderMapProps {
 origin: google.maps.LatLngLiteral;
 destination: google.maps.LatLngLiteral;
 waypoints?: google.maps.DirectionsWaypoint[];
 onRouteChanged?: (data: {
  polyline: string;
  distance: number;
  duration: number;
  summary: string;
 }) => void;
 className?: string;
 apiKey: string;
}

const DirectionsController = ({
 origin,
 destination,
 waypoints,
 onRouteChanged,
}: Omit<RouteBuilderMapProps, "apiKey" | "className">) => {
 const map = useMap();
 const routesLibrary = useMapsLibrary("routes");
 const geometryLibrary = useMapsLibrary("geometry");
 const [directionsService, setDirectionsService] =
  useState<google.maps.DirectionsService | null>(null);
 const [directionsRenderer, setDirectionsRenderer] =
  useState<google.maps.DirectionsRenderer | null>(null);

 // Initialize service and renderer
 useEffect(() => {
  if (!routesLibrary || !map) return;
  const ds = new routesLibrary.DirectionsService();
  const dr = new routesLibrary.DirectionsRenderer({
   map,
   draggable: true, // Allow user to drag the route to modify it
  });
  setDirectionsService(ds);
  setDirectionsRenderer(dr);

  return () => {
   dr.setMap(null);
  };
 }, [routesLibrary, map]);

 // Handle directions_changed event
 useEffect(() => {
  if (!directionsRenderer || !onRouteChanged || !geometryLibrary) return;

  const listener = directionsRenderer.addListener("directions_changed", () => {
   const result = directionsRenderer.getDirections();
   if (result) {
    const route = result.routes[0];

    // Calculate total distance and duration
    let totalDistance = 0;
    let totalDuration = 0;
    route.legs.forEach((l) => {
     if (l.distance?.value) totalDistance += l.distance.value;
     if (l.duration?.value) totalDuration += l.duration.value;
    });

    const overviewPolyline = route.overview_polyline;

    onRouteChanged({
     polyline: overviewPolyline,
     distance: totalDistance,
     duration: totalDuration,
     summary: route.summary || "",
    });
   }
  });

  return () => {
   google.maps.event.removeListener(listener);
  };
 }, [directionsRenderer, onRouteChanged, geometryLibrary]);

 const originLat = origin.lat;
 const originLng = origin.lng;
 const destLat = destination.lat;
 const destLng = destination.lng;

 // Calculate route when props change
 useEffect(() => {
  if (!directionsService || !directionsRenderer) return;

  if (!originLat || !originLng || !destLat || !destLng) return;

  // We reconstruct the objects here to ensure stable dependency checking on primitives above
  const currentOrigin = { lat: originLat, lng: originLng };
  const currentDestination = { lat: destLat, lng: destLng };

  directionsService.route(
   {
    origin: currentOrigin,
    destination: currentDestination,
    waypoints: waypoints || [],
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: false,
   },
   (result, status) => {
    if (status === google.maps.DirectionsStatus.OK && result) {
     directionsRenderer.setDirections(result);

     // Initial callback update to sync state
     const route = result.routes[0];
     let totalDistance = 0;
     let totalDuration = 0;
     route.legs.forEach((l) => {
      if (l.distance?.value) totalDistance += l.distance.value;
      if (l.duration?.value) totalDuration += l.duration.value;
     });

     if (onRouteChanged) {
      onRouteChanged({
       polyline: route.overview_polyline,
       distance: totalDistance,
       duration: totalDuration,
       summary: route.summary || ""
      });
     }

    } else {
     console.error("Directions request failed due to " + status);
    }
   }
  );
  // Dependency array uses primitives instead of objects to prevent re-runs on new object references with same values
 }, [directionsService, directionsRenderer, originLat, originLng, destLat, destLng, waypoints, onRouteChanged]);

 return null;
};

export default function RouteBuilderMap({
 apiKey,
 className,
 ...props
}: RouteBuilderMapProps) {
 const center = {
  lat: (props.origin.lat + props.destination.lat) / 2,
  lng: (props.origin.lng + props.destination.lng) / 2,
 };

 return (
  <div className={className || "w-full h-[400px] rounded-lg overflow-hidden"}>
   <APIProvider apiKey={apiKey}>
    <Map
     defaultCenter={center}
     defaultZoom={12}
     mapId="DEMO_MAP_ID" // Replace with valid Map ID if needed for advanced markers
     fullscreenControl={false}
    >
     <DirectionsController {...props} />
    </Map>
   </APIProvider>
  </div>
 );
}
