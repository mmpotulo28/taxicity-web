"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import EditForm from "./EditForm";
import RouteMapView from "@/components/RouteMapView";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

interface RouteData {
  id: string;
  name: string;
  sourceRankId: string;
  destRankId: string;
  baseFare: number;
  distance: number;
  estimatedDuration: number;
  status: string;
  description: string | null;
  polyline: string | null;
  sourceRank: {
    id: string;
    name: string;
    city: string;
    lat: number;
    lng: number;
  };
  destRank: {
    id: string;
    name: string;
    city: string;
    lat: number;
    lng: number;
  };
}

interface PerformanceData {
  stats: {
    tripCount: number;
    avgDuration: number | null;
    avgFare: number | null;
  };
  recentTrips: Array<{
    id: string;
    status: string;
    fare: number | null;
    duration: number | null;
    createdAt: string;
    vehicleTrip: {
      driver: {
        fullName: string | null;
        firstName: string;
        lastName: string;
      };
    } | null;
  }>;
}

// Helper function to get route status color
function getRouteStatusColor(status: string): "success" | "warning" | "default" {
  if (status === "ACTIVE") return "success";
  if (status === "BUSY") return "warning";
  return "default";
}

// Helper function to get trip status color
function getTripStatusColor(status: string): "success" | "primary" | "default" {
  if (status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS") return "primary";
  return "default";
}

export default function RoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [routeResponse, performanceResponse] = await Promise.all([
          axios.get(`/api/routes/${id}`),
          axios.get(`/api/routes/${id}/performance`),
        ]);
        setRoute(routeResponse.data);
        setPerformance(performanceResponse.data);
      } catch (err) {
        setError("Failed to load route details");
        console.error("Error fetching route:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Icon icon="lucide:alert-circle" className="text-5xl text-danger" />
        <p className="text-lg text-default-500">{error || "Route not found"}</p>
        <Link href="/dashboard/routes">
          <Button color="primary" variant="flat">
            Back to Routes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{route.name}</h1>
          <p className="text-default-500 mt-1">
            {route.sourceRank.name} → {route.destRank.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/routes/${route.id}/performance`}>
            <Button variant="flat" color="primary" startContent={<Icon icon="lucide:bar-chart" />}>
              Performance
            </Button>
          </Link>
          <Link href="/dashboard/routes">
            <Button variant="light" startContent={<Icon icon="lucide:arrow-left" />}>
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Route Information & Map */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Route Map */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Route Map</h2>
            </CardHeader>
            <CardBody>
              <RouteMapView
                sourceRank={{ lat: route.sourceRank.lat, lng: route.sourceRank.lng, name: route.sourceRank.name }}
                destRank={{ lat: route.destRank.lat, lng: route.destRank.lng, name: route.destRank.name }}
                polyline={route.polyline}
              />
            </CardBody>
          </Card>

          {/* Route Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Route Information</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-default-50 rounded-lg p-4">
                  <p className="text-sm text-default-500">Source</p>
                  <p className="text-lg font-medium">{route.sourceRank.name}</p>
                  <p className="text-sm text-default-400">{route.sourceRank.city}</p>
                </div>
                <div className="bg-default-50 rounded-lg p-4">
                  <p className="text-sm text-default-500">Destination</p>
                  <p className="text-lg font-medium">{route.destRank.name}</p>
                  <p className="text-sm text-default-400">{route.destRank.city}</p>
                </div>
                <div className="bg-default-50 rounded-lg p-4">
                  <p className="text-sm text-default-500">Base Fare</p>
                  <p className="text-2xl font-bold text-success">R{Number(route.baseFare).toFixed(2)}</p>
                </div>
                <div className="bg-default-50 rounded-lg p-4">
                  <p className="text-sm text-default-500">Status</p>
                  <Chip
                    color={getRouteStatusColor(route.status)}
                    variant="flat"
                    size="sm"
                  >
                    {route.status}
                  </Chip>
                </div>
                <div className="bg-default-50 rounded-lg p-4">
                  <p className="text-sm text-default-500">Distance</p>
                  <p className="text-lg font-medium">{route.distance} km</p>
                </div>
                <div className="bg-default-50 rounded-lg p-4">
                  <p className="text-sm text-default-500">Est. Duration</p>
                  <p className="text-lg font-medium">{route.estimatedDuration} min</p>
                </div>
              </div>
              {route.description && (
                <div className="bg-default-50 rounded-lg p-4">
                  <p className="text-sm text-default-500 mb-2">Description</p>
                  <p className="text-sm">{route.description}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Performance Metrics */}
          {performance && (
            <Card>
              <CardHeader className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Performance Overview</h2>
                <Link href={`/dashboard/routes/${route.id}/performance`}>
                  <Button size="sm" variant="light" color="primary" endContent={<Icon icon="lucide:arrow-right" />}>
                    View Details
                  </Button>
                </Link>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon="lucide:car" className="text-primary text-xl" />
                      <p className="text-sm text-default-600">Total Trips</p>
                    </div>
                    <p className="text-3xl font-bold text-primary">{performance.stats.tripCount}</p>
                  </div>
                  <div className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon="lucide:clock" className="text-success text-xl" />
                      <p className="text-sm text-default-600">Avg. Duration</p>
                    </div>
                    <p className="text-3xl font-bold text-success">
                      {performance.stats.avgDuration ? `${Math.round(performance.stats.avgDuration)} min` : "N/A"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon="lucide:dollar-sign" className="text-warning text-xl" />
                      <p className="text-sm text-default-600">Avg. Fare</p>
                    </div>
                    <p className="text-3xl font-bold text-warning">
                      {performance.stats.avgFare ? `R${performance.stats.avgFare.toFixed(2)}` : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Recent Trips Preview */}
                {performance.recentTrips.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Recent Trips</h3>
                    <div className="space-y-2">
                      {performance.recentTrips.slice(0, 3).map((trip) => (
                        <div
                          key={trip.id}
                          className="flex items-center justify-between bg-default-50 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Icon icon="lucide:car" className="text-default-400" />
                            <div>
                              <p className="text-sm font-medium">
                                {trip.vehicleTrip?.driver?.fullName ||
                                  `${trip.vehicleTrip?.driver?.firstName || ""} ${trip.vehicleTrip?.driver?.lastName || ""}`.trim() ||
                                  "Unknown Driver"}
                              </p>
                              <p className="text-xs text-default-500">
                                {new Date(trip.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {trip.duration && (
                              <span className="text-sm text-default-600">{trip.duration} min</span>
                            )}
                            {trip.fare && (
                              <span className="text-sm font-semibold text-success">R{Number(trip.fare)?.toFixed(2) || -1}</span>
                            )}
                            <Chip
                              color={getTripStatusColor(trip.status)}
                              size="sm"
                              variant="flat"
                            >
                              {trip.status}
                            </Chip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Edit Form Sidebar */}
        <div className="lg:col-span-1">
          <EditForm route={route} />
        </div>
      </section>
    </div>
  );
}
