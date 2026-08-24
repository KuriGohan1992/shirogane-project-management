"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import type {
	AnalyticsTaskHealth,
	AnalyticsTrendPoint,
} from "@/types/analytics";

const tooltipStyle = {
	backgroundColor: "var(--popover)",
	border: "1px solid var(--border)",
	borderRadius: "0.5rem",
	color: "var(--popover-foreground)",
	boxShadow: "0 10px 25px rgb(0 0 0 / 0.12)",
};

export function CompletionTrendChart({
	data,
}: {
	data: AnalyticsTrendPoint[];
}) {
	const hasActivity = data.some(
		(point) => point.created > 0 || point.completed > 0,
	);

	if (!hasActivity) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground">
				No task creation or completion activity in this period.
			</div>
		);
	}

	return (
		<div
			role="img"
			aria-label="Tasks created and completed during the selected analytics period"
			className="min-h-0 flex-1 w-full"
		>
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={data}
					margin={{
						top: 8,
						right: 8,
						left: -18,
						bottom: 0,
					}}
				>
					<CartesianGrid
						vertical={false}
						stroke="var(--border)"
						strokeDasharray="3 3"
					/>

					<XAxis
						dataKey="label"
						tickLine={false}
						axisLine={false}
						tickMargin={10}
						minTickGap={24}
						tick={{
							fill: "var(--muted-foreground)",
							fontSize: 11,
						}}
					/>

					<YAxis
						allowDecimals={false}
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						tick={{
							fill: "var(--muted-foreground)",
							fontSize: 11,
						}}
					/>

					<Tooltip
						contentStyle={tooltipStyle}
						labelStyle={{
							fontWeight: 600,
							color: "var(--popover-foreground)",
						}}
						cursor={{
							stroke: "var(--border)",
							strokeWidth: 1,
						}}
						formatter={(value, name) => [
							Number(value).toLocaleString(),
							name === "completed" ? "Completed" : "Created",
						]}
					/>

					<Area
						type="monotone"
						dataKey="created"
						stroke="var(--muted-foreground)"
						fill="var(--muted-foreground)"
						fillOpacity={0.08}
						strokeWidth={2}
						dot={false}
						activeDot={{ r: 4 }}
					/>

					<Area
						type="monotone"
						dataKey="completed"
						stroke="var(--primary)"
						fill="var(--primary)"
						fillOpacity={0.14}
						strokeWidth={2.5}
						dot={false}
						activeDot={{ r: 4 }}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

const HEALTH_COLORS = {
	completed: "#10b981",
	open: "var(--primary)",
	overdue: "var(--destructive)",
} as const;

export function TaskHealthChart({ data }: { data: AnalyticsTaskHealth }) {
	const chartData = [
		{
			name: "Completed",
			value: data.completed,
			color: HEALTH_COLORS.completed,
		},
		{
			name: "Open",
			value: data.open,
			color: HEALTH_COLORS.open,
		},
		{
			name: "Overdue",
			value: data.overdue,
			color: HEALTH_COLORS.overdue,
		},
	].filter((entry) => entry.value > 0);

	return (
		<div className="grid w-full grid-cols-[9rem_minmax(0,1fr)] items-center gap-5">
			<div
				role="img"
				aria-label={`${data.completed} completed, ${data.open} open, and ${data.overdue} overdue current tasks`}
				className="relative h-32"
			>
				{data.total === 0 ? (
					<div className="absolute inset-3 rounded-full border-[13px] border-muted" />
				) : (
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Tooltip
								contentStyle={tooltipStyle}
								formatter={(value, name) => [
									Number(value).toLocaleString(),
									String(name),
								]}
							/>

							<Pie
								data={chartData}
								dataKey="value"
								nameKey="name"
								innerRadius={39}
								outerRadius={55}
								paddingAngle={chartData.length > 1 ? 2 : 0}
								stroke="var(--card)"
								strokeWidth={2}
							>
								{chartData.map((entry) => (
									<Cell key={entry.name} fill={entry.color} />
								))}
							</Pie>
						</PieChart>
					</ResponsiveContainer>
				)}

				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-xl font-bold tabular-nums text-foreground">
						{data.total.toLocaleString()}
					</span>

					<span className="text-[11px] font-medium text-muted-foreground">
						Tasks
					</span>
				</div>
			</div>

			<div className="space-y-3">
				{[
					{
						label: "Completed",
						value: data.completed,
						color: HEALTH_COLORS.completed,
					},
					{
						label: "Open",
						value: data.open,
						color: HEALTH_COLORS.open,
					},
					{
						label: "Overdue",
						value: data.overdue,
						color: HEALTH_COLORS.overdue,
					},
				].map((item) => (
					<div key={item.label} className="flex items-center gap-2.5 text-sm">
						<span
							aria-hidden="true"
							className="size-2.5 shrink-0 rounded-full"
							style={{
								backgroundColor: item.color,
							}}
						/>

						<span className="min-w-0 flex-1 text-muted-foreground">
							{item.label}
						</span>

						<span className="font-semibold pr-4 tabular-nums text-foreground">
							{item.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
