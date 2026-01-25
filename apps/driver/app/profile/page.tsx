"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Avatar } from "@heroui/avatar";
import { useUser, useClerk } from "@clerk/nextjs";
import { addToast } from "@heroui/toast";

interface DriverProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    address: string | null;
    licenseNumber: string | null;
}

export default function DriverProfilePage() {
    const router = useRouter();
    const { user } = useUser();
    const { signOut } = useClerk();
    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        phoneNumber: "",
        address: "",
        licenseNumber: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/driver/me");
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setFormData({
                    phoneNumber: data.phoneNumber || "",
                    address: data.address || "",
                    licenseNumber: data.licenseNumber || "",
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            addToast({
                title: "Error",
                description: "Failed to load profile",
                color: "danger",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/driver/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                addToast({
                    title: "Success",
                    description: "Profile updated successfully",
                    color: "success",
                });
                fetchProfile(); // Refresh data
            } else {
                addToast({
                    title: "Error",
                    description: "Failed to update profile",
                    color: "danger",
                });
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            addToast({
                title: "Error",
                description: "An error occurred",
                color: "danger",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-4 pb-24 space-y-6">
            <h1 className="text-2xl font-bold">My Profile</h1>

            <Card className="w-full">
                <CardBody className="flex flex-col items-center py-8">
                    <Avatar
                        src={user?.imageUrl}
                        className="w-24 h-24 text-large mb-4"
                        isBordered
                        color="primary"
                    />
                    <h2 className="text-xl font-bold">
                        {profile?.firstName} {profile?.lastName}
                    </h2>
                    <p className="text-default-500">{profile?.email}</p>
                    <div className="mt-2 px-3 py-1 bg-primary-100 text-primary rounded-full text-sm font-medium">
                        Driver
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader className="pb-0">
                    <h3 className="text-lg font-semibold">Personal Details</h3>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Phone Number"
                            placeholder="Enter your phone number"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            variant="bordered"
                        />

                        <Input
                            label="Address"
                            placeholder="Enter your address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            variant="bordered"
                        />

                        <Input
                            label="License Number"
                            placeholder="Enter your license number"
                            value={formData.licenseNumber}
                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            variant="bordered"
                        />

                        <Button
                            type="submit"
                            color="primary"
                            className="w-full mt-4"
                            isLoading={saving}
                        >
                            Save Changes
                        </Button>
                    </form>
                </CardBody>
            </Card>

            <div className="flex flex-col gap-3">
                <Button
                    className="w-full font-medium"
                    color="secondary"
                    variant="flat"
                    onPress={() => router.push("/")}
                >
                    Switch to User Mode
                </Button>

                <Button
                    className="w-full"
                    color="danger"
                    variant="light"
                    onPress={() => signOut()}
                >
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
