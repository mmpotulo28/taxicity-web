"use client";

import { useState } from "react";
import axios from "axios";
import { addToast } from "@heroui/toast";

interface UseRatingReturn {
	submitRating: (tripId: string, rating: number, comment?: string) => Promise<boolean>;
	isLoading: boolean;
	error: string | null;
}

export const useRating = (): UseRatingReturn => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submitRating = async (tripId: string, rating: number, comment?: string): Promise<boolean> => {
		setIsLoading(true);
		setError(null);

		try {
			await axios.post(`/api/trips/${tripId}/rating`, {
				rating,
				comment,
			});

			addToast({
				title: "Rating Submitted",
				description: "Thank you for your feedback!",
				color: "success",
			});

			return true;
		} catch (err: any) {
			console.error("Error submitting rating:", err);
			const errorMessage = err.response?.data?.error || "Failed to submit rating. Please try again.";
			setError(errorMessage);

			addToast({
				title: "Error",
				description: errorMessage,
				color: "danger",
			});
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		submitRating,
		isLoading,
		error,
	};
};
