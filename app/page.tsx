"use client";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useRide } from "@/context/RideContext";
import TripCard from "@/components/TripCard";
import { MapView } from "@/components/map-view";

export default function Home() {
  const router = useRouter();
  const { tripHistory } = useRide();

  const onRequestRide = () => {
    router.push("/ride/route");
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="text-xl font-bold">Welcome, Manelisi 👋</h1>
          <p className="text-xs text-default-500">
            Ready to travel? Find a taxi or view your recent trips.
          </p>
        </div>
        <Avatar
          className="w-12 h-12"
          src="https://img.heroui.chat/image/avatar?w=60&h=60&u=user1"
        />
      </div>
      <MapView />

      {/* Quick Actions */}
      <div className="px-4 mb-2">
        <Button
          className="w-full mb-2"
          color="primary"
          endContent={<Icon icon="lucide:arrow-right" />}
          size="lg"
          onPress={onRequestRide}
        >
          Request a Taxi
        </Button>
        <div className="flex gap-2 justify-between">
          <Button
            as={Link}
            className="flex-1"
            color="primary"
            href="/ride/trip/history"
            startContent={<Icon icon="lucide:clock" />}
            variant="flat"
          >
            Trip History
          </Button>
          <Button
            as={Link}
            className="flex-1"
            color="primary"
            href="/settings"
            startContent={<Icon icon="lucide:settings" />}
            variant="flat"
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold mb-2 mt-2">Recent Trips</h3>
        {tripHistory && tripHistory.length > 0 ? (
          <div className="space-y-2">
            {tripHistory.slice(0, 2).map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onSelect={() => router.push(`/ride/trip/history`)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-default-500">
            No recent trips yet. Book your first ride!
          </p>
        )}
      </div>
    </div>
  );
}
