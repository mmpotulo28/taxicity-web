import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { SupportTicket, SupportMessage } from "@taxicity/database";
import { addToast } from "@heroui/toast";

export type SupportTicketWithMessages = SupportTicket & {
	messages: SupportMessage[];
};

export const useSupportTickets = () => {
	const queryClient = useQueryClient();

	// --- Queries ---
	const {
		data: tickets,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<SupportTicketWithMessages[]>({
		queryKey: ["support-tickets"],
		queryFn: async () => {
			const { data } = await axios.get("/api/support");
			return data;
		},
	});

	// --- Mutations ---

	// Update Ticket Status
	const updateTicketStatusMutation = useMutation({
		mutationFn: async ({ id, status }: { id: string; status: string }) => {
			const { data } = await axios.patch(`/api/support/${id}/status`, { status });
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
			addToast({
				title: "Ticket Updated",
				description: "Support ticket status has been updated.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Update Failed",
				description: "Could not update ticket status.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// Reply to Ticket
	const replyToTicketMutation = useMutation({
		mutationFn: async ({ id, message }: { id: string; message: string }) => {
			const { data } = await axios.post(`/api/support/${id}/reply`, { message });
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
			addToast({
				title: "Reply Sent",
				description: "Your reply has been sent successfully.",
				color: "success",
			});
		},
		onError: (error) => {
			addToast({
				title: "Reply Failed",
				description: "Could not send reply.",
				color: "danger",
			});
			console.error(error);
		},
	});

	// --- Helpers ---
	const getTicketById = (id: string) => {
		return tickets?.find((t) => t.id === id);
	};

	return {
		// Data & Query State
		tickets,
		isLoading,
		isError,
		error,
		refetch,

		// Actions
		updateStatus: updateTicketStatusMutation.mutateAsync,
		replyToTicket: replyToTicketMutation.mutateAsync,

		// Action States
		isUpdating: updateTicketStatusMutation.isPending,
		isReplying: replyToTicketMutation.isPending,

		// Helpers
		getTicketById,
	};
};
