import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SupportTicket, SupportMessage } from "@taxicity/database";

export type SupportTicketWithMessages = SupportTicket & {
	messages: SupportMessage[];
};

export const useSupportTickets = () => {
	return useQuery<SupportTicketWithMessages[]>({
		queryKey: ["support-tickets"],
		queryFn: async () => {
			const { data } = await axios.get("/api/support");
			return data;
		},
	});
};
