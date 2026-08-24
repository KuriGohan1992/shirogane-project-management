import { AlertCircle, CheckCircle, Clock, Users } from "lucide-react";

const taskStats = [
	{
		label: "Completed",
		count: 24,
		icon: CheckCircle,
		color: "text-green-500",
		bgColor: "bg-green-100 dark:bg-green-900",
	},
	{
		label: "In Progress",
		count: 18,
		icon: Clock,
		color: "text-primary",
		bgColor: "bg-brand-soft dark:bg-primary/15",
	},
	{
		label: "Overdue",
		count: 3,
		icon: AlertCircle,
		color: "text-red-500",
		bgColor: "bg-red-100 dark:bg-red-900",
	},
	{
		label: "Assigned to Me",
		count: 12,
		icon: Users,
		color: "text-purple-500",
		bgColor: "bg-purple-100 dark:bg-purple-900",
	},
];

export function TaskOverview() {
	return (
		<div className="bg-card rounded-lg border border-border p-6">
			<h3 className="text-lg font-semibold text-foreground mb-6">
				Task Overview
			</h3>

			<div className="space-y-4">
				{taskStats.map((stat) => (
					<div
						key={stat.label}
						className="flex items-center justify-between p-3 rounded-lg border border-border"
					>
						<div className="flex items-center space-x-3">
							<div
								className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
							>
								<stat.icon className={stat.color} size={20} />
							</div>
							<span className="font-medium text-foreground">{stat.label}</span>
						</div>
						<span className="text-2xl font-bold text-foreground">
							{stat.count}
						</span>
					</div>
				))}
			</div>

			<div className="mt-6 pt-4 border-t border-border">
				<div className="text-sm text-muted-foreground">
					<span className="font-medium">Productivity:</span> 89% completion rate
					this week
				</div>
			</div>
		</div>
	);
}
