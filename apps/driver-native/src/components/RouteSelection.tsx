import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { Card } from "heroui-native/card";
import { Select } from "heroui-native/select";
import { Button } from "heroui-native/button";
import { apiGet, apiPost } from "@/lib/api-client";

interface Route {
        id: string;
        name: string;
        description: string;
}

interface RouteSelectionProps {
        taxiId: string;
        onComplete: () => void;
}

export const RouteSelection: React.FC<RouteSelectionProps> = ({ taxiId, onComplete }) => {
        const [loading, setLoading] = useState(false);
        const [routes, setRoutes] = useState<Route[]>([]);
        const [selectedRoute, setSelectedRoute] = useState("");

        useEffect(() => {
                const fetchRoutes = async () => {
                        try {
                                const data = await apiGet<{ routes?: Route[] }>("/api/driver/routes");
                                setRoutes(data.routes || []);
                        } catch (error) {
                                console.error(error);
                        }
                };
                fetchRoutes();
        }, []);

        const handleSubmit = async () => {
                if (!selectedRoute) return;
                setLoading(true);
                try {
                        await apiPost("/api/driver/routes/assign", {
                                taxiId,
                                routeId: selectedRoute,
                        });
                        onComplete();
                } catch (error) {
                        console.error(error);
                } finally {
                        setLoading(false);
                }
        };

        const selectedOption = selectedRoute 
                ? { value: selectedRoute, label: routes.find(r => r.id === selectedRoute)?.name || selectedRoute } 
                : undefined;

        return (
                <Card className='w-full max-w-md mx-auto mt-10'>
                        <Card.Header className='flex flex-col gap-2'>
                                <Text className='text-2xl font-bold'>Select Your Route</Text>
                                <Text className='text-default-500'>Choose the route you will be operating on today.</Text>
                        </Card.Header>
                        <Card.Body className='flex flex-col gap-4'>
                                <Select 
                                        value={selectedOption} 
                                        onValueChange={(val: any) => setSelectedRoute(val?.value || "")}
                                >
                                        <Select.Trigger>
                                                <Select.Value placeholder='Choose a route' />
                                                <Select.TriggerIndicator />
                                        </Select.Trigger>
                                        <Select.Portal>
                                                <Select.Overlay />
                                                <Select.Content presentation="popover" width="trigger">
                                                        {routes.map((route) => (
                                                                <Select.Item key={route.id} value={route.id} label={route.name} />
                                                        ))}
                                                </Select.Content>
                                        </Select.Portal>
                                </Select>
                                <Button variant='primary' onPress={handleSubmit} isDisabled={!selectedRoute || loading}>
                                        <Button.Label>{loading ? 'Starting...' : 'Start Driving'}</Button.Label>
                                </Button>
                        </Card.Body>
                </Card>
        );
};
