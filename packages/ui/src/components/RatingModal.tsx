"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Icon } from "@iconify/react";
import { iTrip } from "../types";
import { useRating } from "../hooks/useRating";

interface RatingModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    trip: iTrip | null;
    onClose?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
    isOpen,
    onOpenChange,
    trip,
    onClose
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const { submitRating, isLoading } = useRating();

    const handleSubmit = async () => {
        if (!trip) return;

        if (rating === 0) {
            // Validate rating
            return;
        }

        const success = await submitRating(trip.id, rating, comment);
        if (success) {
            onOpenChange(false);
            if (onClose) onClose();
            // Reset state
            setRating(0);
            setComment("");
        }
    };

    const handleStarClick = (selectedRating: number) => {
        setRating(selectedRating);
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open && onClose) onClose();
                onOpenChange(open);
            }}
            placement="center"
            isDismissable={false}
            hideCloseButton
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 items-center text-center pt-8">
                            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-2 text-success">
                                <Icon icon="lucide:check" width={32} />
                            </div>
                            <h2 className="text-xl font-bold">Ride Completed!</h2>
                            <p className="text-sm text-default-500 font-normal">
                                How was your ride with {trip?.driver}?
                            </p>
                        </ModalHeader>
                        <ModalBody className="py-6">
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-transform hover:scale-110 focus:outline-none"
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
                                minRows={3}
                                variant="bordered"
                            />
                        </ModalBody>
                        <ModalFooter className="flex-col gap-2 pb-6">
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={isLoading}
                                isDisabled={rating === 0}
                                className="w-full font-semibold"
                                size="lg"
                            >
                                Submit Rating
                            </Button>
                            <Button
                                color="default"
                                variant="light"
                                onPress={() => {
                                    close();
                                    if (onClose) onClose();
                                }}
                                className="w-full"
                            >
                                Skip
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default RatingModal;
