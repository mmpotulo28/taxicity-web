import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";

export interface DashboardStatProps {
	title: string;
	value: string | number;
	icon: string;
	color: string;
	change?: string;
	loading?: boolean;
}

export const DashboardStatCard = ({
	title,
	value,
	icon,
	color,
	change,
	loading = false,
}: DashboardStatProps) => (
	<Card className="shadow-sm">
		<CardBody className="p-4">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-default-500">{title}</p>
					{loading ? (
						<div className="h-8 w-24 bg-default-100 rounded-md animate-pulse mt-1" />
					) : (
						<p className="text-2xl font-bold mt-1">{value}</p>
					)}
					{!loading && change && (
						<p
							className={`text-xs flex items-center gap-1 mt-1 ${change.startsWith("+") ? "text-success-600" : "text-danger-600"
								}`}>
							<Icon
								icon={
									change.startsWith("+")
										? "lucide:trending-up"
										: "lucide:trending-down"
								}
							/>
							{change} from yesterday
						</p>
					)}
				</div>
				<div
					className={`w-12 h-12 rounded-full bg-${color}/20 flex items-center justify-center`}>
					<Icon className={`text-${color} text-2xl`} icon={icon} />
				</div>
			</div>
		</CardBody>
	</Card>
);

export const DashboardStatsGrid = ({ stats, isLoading }: { stats: DashboardStatProps[], isLoading: boolean }) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{stats.map((stat, index) => (
				<DashboardStatCard key={index} {...stat} loading={isLoading} />
			))}
		</div>
	);
};
