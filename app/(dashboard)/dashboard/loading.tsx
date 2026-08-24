import { Skeleton } from "@/components/ui/skeleton";

const TASK_ROWS = ["task-1", "task-2", "task-3", "task-4"];

const ACTIVITY_ROWS = [
	"activity-1",
	"activity-2",
	"activity-3",
	"activity-4",
	"activity-5",
	"activity-6",
	"activity-7",
];

const PROJECT_CARDS = ["project-1", "project-2", "project-3", "project-4"];

function PanelHeaderSkeleton() {
	return (
		<div className="shrink-0 border-b border-primary bg-primary px-5 py-3">
			<Skeleton className="h-6 w-32 bg-primary-foreground/25" />
		</div>
	);
}

function TaskRowSkeleton() {
	return (
		<div className="flex items-center gap-4 px-5 py-3">
			<Skeleton className="h-10 w-[3px] shrink-0 rounded-sm" />

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-5 w-16 rounded-full" />
				</div>

				<div className="mt-2 flex items-center gap-2">
					<Skeleton className="h-3 w-28" />
					<Skeleton className="h-3 w-px rounded-none" />
					<Skeleton className="h-3 w-20" />
				</div>
			</div>

			<Skeleton className="h-3 w-20 shrink-0" />
		</div>
	);
}

function ActivityRowSkeleton() {
	return (
		<div className="flex gap-3 px-4 py-3">
			<Skeleton className="size-8 shrink-0 rounded-full" />

			<div className="min-w-0 flex-1">
				<Skeleton className="h-4 w-4/5" />

				<div className="mt-2 flex items-center gap-4">
					<Skeleton className="h-3 w-32" />
					<Skeleton className="ml-auto h-3 w-24" />
				</div>
			</div>
		</div>
	);
}

function RecentProjectSkeleton() {
	return (
		<div className="relative h-full overflow-hidden rounded-lg border border-border bg-background p-4 pt-5">
			<Skeleton className="absolute inset-x-0 top-0 h-2 rounded-none" />

			<div className="flex items-center justify-between">
				<Skeleton className="h-3 w-12" />
			</div>

			<Skeleton className="mt-3 h-4 w-3/4" />

			<Skeleton className="mt-3 h-3 w-full" />
			<Skeleton className="mt-2 h-3 w-4/5" />

			<div className="mt-4 border-t border-border pt-3">
				<Skeleton className="h-3 w-32" />
			</div>
		</div>
	);
}

export default function DashboardLoading() {
	return (
		<div className="flex min-h-[calc(100vh-8rem)] flex-col gap-5 xl:h-[calc(100vh-8rem)] xl:min-h-0 xl:overflow-hidden">
			<div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(25rem,0.88fr)]">
				<div className="flex min-h-0 flex-col">
					<div className="flex shrink-0 items-start justify-between gap-6">
						<div>
							<Skeleton className="h-9 w-40" />
							<Skeleton className="mt-2 h-5 w-44" />
						</div>

						<Skeleton className="h-10 w-32" />
					</div>

					<div className="mt-4 flex shrink-0 items-start gap-8">
						{["metric-1", "metric-2", "metric-3"].map((id) => (
							<div key={id} className="min-w-32">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="mt-2 h-7 w-8" />
							</div>
						))}
					</div>

					<section className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
						<PanelHeaderSkeleton />

						<div className="divide-y divide-border">
							{TASK_ROWS.map((id) => (
								<TaskRowSkeleton key={id} />
							))}
						</div>
					</section>
				</div>

				<section className="flex min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-card xl:min-h-0">
					<PanelHeaderSkeleton />

					<div className="divide-y divide-border">
						{ACTIVITY_ROWS.map((id) => (
							<ActivityRowSkeleton key={id} />
						))}
					</div>
				</section>
			</div>

			<section className="flex h-64 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
				<div className="flex shrink-0 items-center justify-between border-b border-primary bg-primary px-5 py-3">
					<Skeleton className="h-6 w-36 bg-primary-foreground/25" />
					<Skeleton className="h-3 w-12 bg-primary-foreground/25" />
				</div>

				<div className="grid min-h-0 flex-1 grid-cols-2 gap-3 p-3 lg:grid-cols-4">
					{PROJECT_CARDS.map((id) => (
						<RecentProjectSkeleton key={id} />
					))}
				</div>
			</section>
		</div>
	);
}
