export type RankOption = {
	id: string;
	name: string;
	address: string;
	sourceRoutes?: { id: string; name: string }[];
};

export type QueueStatus = {
	inQueue: boolean;
	rank?: { name: string; sourceRoutes?: { id: string; name: string }[] };
	position?: number;
	queueLength?: number;
} | null;
