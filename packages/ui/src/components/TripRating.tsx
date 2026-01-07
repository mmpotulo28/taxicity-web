"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Icon } from "@iconify/react";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { iTrip } from "../types";
import { useRating } from "../hooks/useRating";
import { useRide } from "../context/RideContext";

interface TripRatingProps {
    trip: iTrip;
    onCompleted?: () => void;
}

const TripRating: React.FC<TripRatingProps> = ({ trip, onCompleted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const { submitRating, isLoading } = useRating();
    const { setActiveTrip } = useRide();

    const handleSubmit = async () => {
        if (!trip) return;

        if (rating === 0) {
            return;
        }

        const success = await submitRating(trip.id, rating, comment);
        if (success) {
            handleComplete();
        }
    };

    const handleComplete = () => {
        // Clear active trip to return to home state
        setActiveTrip(null);
        if (onCompleted) onCompleted();
    };

    const handleStarClick = (selectedRating: number) => {
        setRating(selectedRating);
    };

    return (
        <Card className="w-full shadow-lg border-success-200 bg-success-50/50">
            <CardHeader className="flex flex-col gap-1 items-center text-center pt-6 pb-2">
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-1 text-success-600">
                    <Icon icon="lucide:check-circle-2" width={24} />
                </div>
                <h2 className="text-lg font-bold text-success-900">Ride Completed</h2>
                <p className="text-xs text-success-700/80 font-medium">
                    How was your ride with {trip.driver}?
                </p>
            </CardHeader>
            <CardBody className="py-2 overflow-hidden">
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="transition-transform hover:scale-110 focus:outline-none p-1"
                            onClick={() => handleStarClick(star)}
                        >
                            <Icon
                                icon="lucide:star"
                                width={32}
                                className={star <= rating ? "text-warning fill-current" : "text-default-300"}
                            />
                        </button>
                    ))}
                </div>

                <Textarea
                    label="Leave a comment (optional)"
                    placeholder="Tell us about your experience..."
                    value={comment}
                    onValueChange={setComment}
                    minRows={2}
                    variant="faded"
                    className="mb-2"
                />
            </CardBody>
            <CardFooter className="flex-col gap-2 pt-0 pb-6">
                <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={isLoading}
                    isDisabled={rating === 0}
                    className="w-full font-semibold shadow-md shadow-primary/20"
                >
                    Submit Rating
                </Button>
                <Button
                    color="default"
                    variant="light"
                    onPress={handleComplete}
                    className="w-full text-default-500"
                    size="sm"
                >
                    Skip
                </Button>
            </CardFooter>
        </Card>
    );
};

export default TripRating;
