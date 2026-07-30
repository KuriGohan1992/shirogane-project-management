import { auth } from "@clerk/nextjs/server";
import { BarChart3, Clock, TrendingUp, Users } from "lucide-react";

const metrics = [
	{
		title: "Project Velocity",
		value: "8.5",
		unit: "tasks/week",
		icon: TrendingUp,
	},
	{
		title: "Team Efficiency",
		value: "92%",
		unit: "completion rate",
		icon: BarChart3,
	},
	{
		title: "Active Users",
		value: "24",
		unit: "this week",
		icon: Users,
	},
	{
		title: "Avg. Task Time",
		value: "2.3",
		unit: "days",
		icon: Clock,
	},
];

export default async function AnalyticsPage() {
	await auth.protect();
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-foreground">Analytics</h1>
				<p className="text-muted-foreground mt-2">
					Track project performance and team productivity
				</p>
			</div>

			{/* Implementation Tasks Banner */}
			<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
				<h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
					📊 Analytics Implementation Tasks
				</h3>
				<ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
					<li>• Task 6.6: Optimize performance and implement loading states</li>
					<li>• Task 8.5: Set up performance monitoring and analytics</li>
				</ul>
			</div>

			{/* Analytics Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{metrics.map((metric) => {
					const Icon = metric.icon;

					return (
						<div
							key={metric.title}
							className="rounded-lg border border-border bg-card p-6"
						>
							<div className="mb-4 flex items-center justify-between">
								<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
									<Icon className="text-primary" size={20} />
								</div>
							</div>

							<div className="mb-1 text-2xl font-bold text-foreground">
								{metric.value}
							</div>

							<div className="mb-2 text-sm text-muted-foreground">
								{metric.unit}
							</div>

							<div className="text-xs font-medium text-foreground">
								{metric.title}
							</div>
						</div>
					);
				})}
			</div>

			{/* Charts Placeholder */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-card rounded-lg border border-border p-6">
					<h3 className="text-lg font-semibold text-foreground mb-4">
						Project Progress
					</h3>
					<div className="h-64 bg-muted rounded-lg flex items-center justify-center">
						<div className="text-center text-muted-foreground">
							<BarChart3 size={48} className="mx-auto mb-2" />
							<p>Chart Component Placeholder</p>
							<p className="text-sm">
								TODO: Implement with Chart.js or Recharts
							</p>
						</div>
					</div>
				</div>

				<div className="bg-card rounded-lg border border-border p-6">
					<h3 className="text-lg font-semibold text-foreground mb-4">
						Team Activity
					</h3>
					<div className="h-64 bg-muted rounded-lg flex items-center justify-center">
						<div className="text-center text-muted-foreground">
							<TrendingUp size={48} className="mx-auto mb-2" />
							<p>Activity Chart Placeholder</p>
							<p className="text-sm">TODO: Implement activity timeline</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
