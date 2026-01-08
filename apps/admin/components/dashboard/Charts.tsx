import {
	ResponsiveContainer,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ReferenceLine,
} from "recharts";

// Trip Activity Bar Chart
export const TripActivityChart = ({ data }: { data: any[] }) => {
	return (
		<ResponsiveContainer height="100%" width="100%">
			<BarChart
				data={data}
				margin={{
					top: 10,
					right: 30,
					left: 0,
					bottom: 0,
				}}>
				<CartesianGrid opacity={0.1} strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey="name" />
				<YAxis />
				<Tooltip
					contentStyle={{
						backgroundColor: "var(--background)",
						borderColor: "var(--divider)",
					}}
				/>
				<Legend />
				<Bar dataKey="trips" fill="#0070F3" name="Trip Count" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	);
};

// Revenue Breakdown Pie Chart
export const RevenueBreakdownChart = ({ data }: { data: any[] }) => {
	return (
		<ResponsiveContainer height="100%" width="100%">
			<PieChart>
				<Pie
					cx="50%"
					cy="45%"
					data={data}
					dataKey="value"
					fill="#8884d8"
					innerRadius={60}
					label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
					outerRadius={80}
					paddingAngle={5}>
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.color} />
					))}
				</Pie>
				<Tooltip
					contentStyle={{
						backgroundColor: "var(--background)",
						borderColor: "var(--divider)",
					}}
				/>
				<Legend align="center" layout="horizontal" verticalAlign="bottom" />
			</PieChart>
		</ResponsiveContainer>
	);
};

// Revenue Trend Line Chart
export const RevenueTrendChart = ({ data }: { data: any[] }) => {
	return (
		<ResponsiveContainer height="100%" width="100%">
			<LineChart
				data={data}
				margin={{
					top: 5,
					right: 30,
					left: 20,
					bottom: 5,
				}}>
				<CartesianGrid opacity={0.1} strokeDasharray="3 3" />
				<XAxis dataKey="name" />
				<YAxis />
				<Tooltip
					contentStyle={{
						backgroundColor: "var(--background)",
						borderColor: "var(--divider)",
					}}
					formatter={(value) => [`R${value}`, "Revenue"]}
				/>
				<Legend />
				<Line
					activeDot={{ r: 8 }}
					dataKey="revenue"
					stroke="#10B981"
					strokeWidth={2}
					type="monotone"
				/>
			</LineChart>
		</ResponsiveContainer>
	);
};

// Driver Activity Area Chart
export const DriverActivityChart = ({ data }: { data: any[] }) => {
	return (
		<ResponsiveContainer height="100%" width="100%">
			<AreaChart
				data={data}
				margin={{
					top: 10,
					right: 30,
					left: 0,
					bottom: 0,
				}}>
				<CartesianGrid opacity={0.1} strokeDasharray="3 3" />
				<XAxis dataKey="name" />
				<YAxis />
				<Tooltip
					contentStyle={{
						backgroundColor: "var(--background)",
						borderColor: "var(--divider)",
					}}
				/>
				<Legend />
				<Area
					dataKey="active"
					fill="#0070F3"
					fillOpacity={0.6}
					stackId="1"
					stroke="#0070F3"
					type="monotone"
				/>
				<Area
					dataKey="idle"
					fill="#10B981"
					fillOpacity={0.6}
					stackId="1"
					stroke="#10B981"
					type="monotone"
				/>
				<Area
					dataKey="offline"
					fill="#F59E0B"
					fillOpacity={0.6}
					stackId="1"
					stroke="#F59E0B"
					type="monotone"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};

// Rank Occupancy Chart
export const RankOccupancyChart = ({ data, capacity }: { data: any[]; capacity: number }) => {
	return (
		<ResponsiveContainer height="100%" width="100%">
			<LineChart
				data={data}
				margin={{
					top: 5,
					right: 20,
					left: 0,
					bottom: 5,
				}}>
				<CartesianGrid opacity={0.1} strokeDasharray="3 3" />
				<XAxis dataKey="day" />
				<YAxis domain={[0, capacity]} />
				<Tooltip
					contentStyle={{
						backgroundColor: "var(--background)",
						borderColor: "var(--divider)",
					}}
				/>
				<Line
					activeDot={{ r: 8 }}
					dataKey="occupancy"
					name="Taxis"
					stroke="#0070F3"
					strokeWidth={2}
					type="monotone"
				/>
				<ReferenceLine
					label={{
						value: "Capacity",
						position: "insideTopRight",
						fill: "rgba(249, 115, 22, 0.8)",
						fontSize: 12,
					}}
					stroke="rgba(249, 115, 22, 0.5)"
					strokeDasharray="3 3"
					y={capacity}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
};

// Trip Profile Chart
export const TripProfileChart = ({ data }: { data: any[] }) => {
	return (
		<ResponsiveContainer height="100%" width="100%">
			<AreaChart
				data={data}
				margin={{
					top: 10,
					right: 30,
					left: 0,
					bottom: 0,
				}}>
				<defs>
					<linearGradient id="colorElevation" x1="0" x2="0" y1="0" y2="1">
						<stop offset="5%" stopColor="#0070F3" stopOpacity={0.8} />
						<stop offset="95%" stopColor="#0070F3" stopOpacity={0.1} />
					</linearGradient>
				</defs>
				<CartesianGrid opacity={0.1} strokeDasharray="3 3" vertical={false} />
				<XAxis dataKey="time" />
				<YAxis />
				<Tooltip
					contentStyle={{
						backgroundColor: "var(--background)",
						borderColor: "var(--divider)",
					}}
				/>
				<Area
					dataKey="elevation"
					fill="url(#colorElevation)"
					fillOpacity={1}
					name="Route Elevation"
					stroke="#0070F3"
					type="monotone"
				/>
				<Line
					dataKey="speed"
					dot={false}
					name="Speed (km/h)"
					stroke="#F59E0B"
					strokeWidth={2}
					type="monotone"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};
