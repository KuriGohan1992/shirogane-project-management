import { FolderOpen } from "lucide-react";
import Link from "next/link";

import {
	CompletionTrendChart,
	TaskHealthChart,
} from "@/components/analytics/analytics-charts";
import { ProjectProgressPanel } from "@/components/analytics/project-progress-panel";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import type {
	AnalyticsData,
	AnalyticsMetric,
	AnalyticsPriority,
} from "@/types/analytics";
import { AnalyticsFilterControls } from "./analytics-filter-controls";

type DeltaDirection = "higher" | "lower";

const PRIORITY_STYLES: Record<
	AnalyticsPriority,
	{
		label: string;
		color: string;
	}
> = {
	urgent: {
		label: "Urgent",
		color: "#ef4444",
	},
	high: {
		label: "High",
		color: "#f97316",
	},
	medium: {
		label: "Medium",
		color: "#d97706",
	},
	low: {
		label: "Low",
		color: "#0ea5e9",
	},
	none: {
		label: "No priority",
		color: "var(--muted-foreground)",
	},
};

function AnalyticsPanel({
	title,
	children,
	className,
	bodyClassName,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
	bodyClassName?: string;
}) {
	return (
		<section
			className={cn(
				"flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card",
				className,
			)}
		>
			<div className="shrink-0 border-b border-primary bg-primary px-5 py-3 text-primary-foreground">
				<h2 className="text-lg font-bold">{title}</h2>
			</div>

			<div className={cn("min-h-0 flex-1 p-4", bodyClassName)}>{children}</div>
		</section>
	);
}

function getDeltaClass(deltaPercent: number, direction: DeltaDirection) {
	if (deltaPercent === 0) {
		return "text-muted-foreground";
	}

	const improved = direction === "higher" ? deltaPercent > 0 : deltaPercent < 0;

	return improved
		? "text-emerald-600 dark:text-emerald-400"
		: "text-destructive";
}

function MetricStat({
	label,
	metric,
	value,
	detail,
	direction,
}: {
	label: string;
	metric: AnalyticsMetric;
	value: string;
	detail: string;
	direction: DeltaDirection;
}) {
	const delta = metric.deltaPercent;

	return (
		<div className="min-w-0">
			<dt className="text-sm font-semibold text-muted-foreground">{label}</dt>

			<div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
				<dd className="text-2xl font-bold tracking-tight text-foreground">
					{value}
				</dd>

				{delta !== null && (
					<span
						title="Compared with the prior period"
						className={cn(
							"whitespace-nowrap text-xs font-semibold",
							getDeltaClass(delta, direction),
						)}
					>
						<span aria-hidden="true">
							{delta > 0 ? "+" : ""}
							{delta.toFixed(1)}%
						</span>

						<span className="sr-only">
							{delta > 0 ? "Up" : delta < 0 ? "Down" : "No change"}{" "}
							{Math.abs(delta).toFixed(1)} percent compared with the prior
							period
						</span>
					</span>
				)}
			</div>

			<p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
		</div>
	);
}

function formatDays(value: number | null) {
	return value === null ? "—" : `${value.toFixed(1)}d`;
}

function formatPercent(value: number | null) {
	return value === null ? "—" : `${Math.round(value)}%`;
}

function PriorityDistribution({ data }: { data: AnalyticsData }) {
	const total = data.priorityDistribution.reduce(
		(sum, item) => sum + item.count,
		0,
	);

	if (total === 0) {
		return (
			<div className="text-sm text-muted-foreground">
				No open tasks to analyze.
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{data.priorityDistribution.map((item) => {
				const style = PRIORITY_STYLES[item.priority];

				const percentage = Math.round((item.count / total) * 100);

				return (
					<div key={item.priority}>
						<div className="mb-1.5 flex items-center justify-between gap-4">
							<div className="flex min-w-0 items-center gap-2">
								<span
									aria-hidden="true"
									className="size-2.5 shrink-0 rounded-full"
									style={{
										backgroundColor: style.color,
									}}
								/>

								<span className="truncate text-sm font-medium text-foreground">
									{style.label}
								</span>
							</div>

							<span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
								{item.count} · {percentage}%
							</span>
						</div>

						<div
							role="progressbar"
							aria-label={`${style.label} share of open tasks`}
							aria-valuenow={percentage}
							aria-valuemin={0}
							aria-valuemax={100}
							className="h-2 overflow-hidden rounded-full bg-muted"
						>
							<div
								className="h-full rounded-full"
								style={{
									width: `${percentage}%`,
									backgroundColor: style.color,
								}}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function Contributors({ data }: { data: AnalyticsData }) {
	if (data.contributors.length === 0) {
		return (
			<div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
				No collaborator activity in this period.
			</div>
		);
	}

	const topActivity = Math.max(
		1,
		...data.contributors.map((contributor) => contributor.activityCount),
	);

	return (
		<div className="h-full overflow-y-auto">
			{data.contributors.map((contributor, index) => {
				const name = contributor.user.name ?? contributor.user.email;

				const percentage = Math.round(
					(contributor.activityCount / topActivity) * 100,
				);

				return (
<div
	key={contributor.user.id}
	className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 border-b border-border py-2.5 pl-2 pr-4 last:border-b-0"
>
	<div className="flex items-center gap-2">
		<span className="w-5 text-center text-xs font-medium tabular-nums text-muted-foreground">
			{index + 1}
		</span>

		<UserAvatar user={contributor.user} className="size-8 shrink-0" />
	</div>

	<div className="min-w-0">
							<div className="flex min-w-0 items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold leading-tight text-foreground">
										{name}
									</p>

									<p className="mt-0.5 truncate text-xs leading-tight text-muted-foreground">
										{contributor.user.jobTitle ?? contributor.user.email}
									</p>
								</div>

								<div className="shrink-0 text-right">
									<p className="text-xs font-semibold leading-tight tabular-nums text-foreground">
										{contributor.activityCount}{" "}
										{contributor.activityCount === 1
											? "activity"
											: "activities"}
									</p>

									<p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
										{contributor.completedCount}{" "}
										{contributor.completedCount === 1 ? "task" : "tasks"}{" "}
										completed
									</p>
								</div>
							</div>

							<div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-primary transition-[width]"
									style={{
										width: `${percentage}%`,
									}}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
	if (!data.hasProjects) {
		return (
			<div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center">
				<FolderOpen
					aria-hidden="true"
					className="size-8 text-muted-foreground"
				/>

				<h2 className="mt-4 text-lg font-bold text-foreground">
					No projects to analyze
				</h2>

				<p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
					Analytics will populate as projects, tasks, and activity are recorded.
				</p>

				<Button asChild size="sm" className="mt-5">
					<Link href="/projects">Go to projects</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 xl:h-[calc(100vh-8rem)] xl:min-h-0 xl:overflow-hidden">
			<div className="grid shrink-0 gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(22rem,0.78fr)]">
				<div className="flex min-h-0 flex-col gap-4">
					<div className="shrink-0">
						<div>
							<h1 className="text-3xl font-bold tracking-tight text-foreground">
								Analytics
							</h1>

							<p className="mt-1 text-base font-medium text-muted-foreground">
								Track delivery, workload, and collaboration across your
								projects.
							</p>
						</div>

						<dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-4">
							<MetricStat
								label="Completed tasks"
								metric={data.overview.completedTasks}
								value={(
									data.overview.completedTasks.current ?? 0
								).toLocaleString()}
								detail={data.filters.periodLabel}
								direction="higher"
							/>

							<MetricStat
								label="Avg. completion time"
								metric={data.overview.avgCompletionDays}
								value={formatDays(data.overview.avgCompletionDays.current)}
								detail="Created → completed"
								direction="lower"
							/>

							<MetricStat
								label="On-time completion"
								metric={data.overview.onTimeRate}
								value={formatPercent(data.overview.onTimeRate.current)}
								detail={
									data.overview.onTimeRate.sampleSize === 1
										? "1 scheduled completion"
										: `${data.overview.onTimeRate.sampleSize} scheduled completions`
								}
								direction="higher"
							/>

							<MetricStat
								label="Active collaborators"
								metric={data.overview.activeCollaborators}
								value={(
									data.overview.activeCollaborators.current ?? 0
								).toLocaleString()}
								detail={data.filters.periodLabel}
								direction="higher"
							/>
						</dl>
					</div>

					<AnalyticsPanel
						title="Completion trend"
						className="min-h-[18rem] flex-1"
						bodyClassName="flex min-h-0 flex-col"
					>
						<div className="mb-3 flex shrink-0 justify-end gap-4 text-xs font-medium text-muted-foreground">
							<span className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-muted-foreground" />
								Created
							</span>

							<span className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-primary" />
								Completed
							</span>
						</div>

						<CompletionTrendChart data={data.trend} />
					</AnalyticsPanel>
				</div>

				<div className="flex flex-col gap-4">
					<div className="flex shrink-0 justify-end">
						<AnalyticsFilterControls
							period={data.filters.period}
							projectId={data.filters.selectedProjectId}
							projects={data.projectOptions}
						/>
					</div>

					<AnalyticsPanel
						title="Task health"
						className="shrink-0"
						bodyClassName="py-4"
					>
						<TaskHealthChart data={data.taskHealth} />
					</AnalyticsPanel>

					<AnalyticsPanel title="Open task priorities" className="shrink-0">
						<PriorityDistribution data={data} />
					</AnalyticsPanel>
				</div>
			</div>

			<div className="grid min-h-[17rem] flex-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
				<ProjectProgressPanel projects={data.projectProgress} />

				<AnalyticsPanel
					title="Most active collaborators"
					className="min-h-0"
					bodyClassName="p-0"
				>
					<Contributors data={data} />
				</AnalyticsPanel>
			</div>
		</div>
	);
}
