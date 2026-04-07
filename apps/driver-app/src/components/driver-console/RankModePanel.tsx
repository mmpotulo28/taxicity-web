import { Pressable, ScrollView, Text, View } from "react-native";
import { QueueStatusCard } from "./QueueStatusCard";
import type { QueueStatus, RankOption } from "./types";

export function RankModePanel({
	ranks,
	selectedRankId,
	queueStatus,
	busy,
	onSelectRank,
	onJoin,
	onLeave,
}: Readonly<{
	ranks: RankOption[];
	selectedRankId: string;
	queueStatus: QueueStatus;
	busy: boolean;
	onSelectRank: (id: string) => void;
	onJoin: () => void;
	onLeave: () => void;
}>) {
	if (queueStatus?.inQueue) {
		return <QueueStatusCard queueStatus={queueStatus} onLeave={onLeave} />;
	}

	return (
		<View className='gap-4 mt-2'>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName='gap-2'>
				{ranks.map((rank) => {
					const active = selectedRankId === rank.id;
					return (
						<Pressable 
							key={rank.id} 
							onPress={() => onSelectRank(rank.id)} 
							className={`px-4 py-3 rounded-2xl border-2 shadow-sm transition-all ${
								active 
									? "bg-amber-400 border-amber-500" 
									: "bg-slate-50 border-slate-300"
							}`}
						>
							<Text className={`font-bold text-lg ${active ? "text-amber-900" : "text-slate-700"}`}>
								📌 {rank.name}
							</Text>
							<Text className={`text-xs font-semibold mt-1 flex-1 ${active ? "text-amber-800" : "text-slate-500"}`}>
								{rank.address}
							</Text>
						</Pressable>
					);
				})}
			</ScrollView>
			<Pressable 
				onPress={onJoin} 
				disabled={!selectedRankId || busy} 
				className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 border-b-4 transition-all shadow-md mt-2 ${
					!selectedRankId || busy
						? "bg-slate-300 border-slate-400"
						: "bg-emerald-500 border-emerald-700"
				}`}
			>
				<Text className={`font-bold text-lg ${!selectedRankId || busy ? "text-slate-500" : "text-white"}`}>
					{busy ? "🔄 Joining..." : "✨ Join Queue"}
				</Text>
			</Pressable>
		</View>
	);
}
