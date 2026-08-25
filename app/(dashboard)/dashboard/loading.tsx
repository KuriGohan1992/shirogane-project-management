import { Skeleton } from "@/components/ui/skeleton";

const TASK_ROWS = [
	"task-1",
	"task-2",
	"task-3",
	"task-4",
	"task-5",
	"task-6",
	"task-7",
	"task-8",
];

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
		<div className="flex min-w-0 items-start gap-3 px-4 py-3 sm:items-center sm:gap-4 sm:px-5">
			<Skeleton className="h-10 w-[3px] shrink-0 rounded-sm" />

			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-center gap-2">
					<Skeleton className="h-4 min-w-0 flex-1 sm:max-w-48" />
					<Skeleton className="h-5 w-14 shrink-0 rounded-full" />
				</div>

				<div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
					<Skeleton className="h-3 w-24 max-w-[40%]" />
					<Skeleton className="h-3 w-px shrink-0 rounded-none" />
					<Skeleton className="h-3 w-16" />
					<Skeleton className="h-3 w-20 sm:hidden" />
				</div>
			</div>

			<Skeleton className="hidden h-3 w-20 shrink-0 sm:block" />
		</div>
	);
}

function ActivityRowSkeleton() {
	return (
		<div className="flex min-w-0 gap-3 px-4 py-3">
			<Skeleton className="size-8 shrink-0 rounded-full" />

			<div className="min-w-0 flex-1">
				<Skeleton className="h-4 w-4/5" />
				<Skeleton className="mt-1.5 h-4 w-2/3" />

				<div className="mt-2 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<Skeleton className="h-3 w-28" />
					<Skeleton className="h-3 w-20 sm:ml-auto" />
				</div>
			</div>
		</div>
	);
}

function RecentProjectSkeleton() {
	return (
		<div className="relative flex h-full w-[17rem] shrink-0 flex-col overflow-hidden rounded-lg border border-border px-4 pb-3 pt-3 xl:w-auto xl:shrink">
			<Skeleton className="absolute inset-x-0 top-0 h-3 rounded-none" />

			<div className="mt-1 min-w-0">
				<Skeleton className="h-3 w-12" />
				<Skeleton className="mt-2 h-4 w-3/4" />
				<Skeleton className="mt-2 h-3 w-full" />
				<Skeleton className="mt-1.5 h-3 w-4/5" />
			</div>

			<div className="mt-auto space-y-2 border-t border-border pt-2">
				<Skeleton className="h-3 w-36" />
				<Skeleton className="h-3 w-32" />
			</div>
		</div>
	);
}

export default function DashboardLoading() {
	return (
		<div className="flex min-h-[calc(100vh-8rem)] min-w-0 flex-col gap-5 xl:h-[calc(100vh-8rem)] xl:min-h-0 xl:overflow-hidden">
			<div className="grid min-h-0 min-w-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(25rem,0.88fr)]">
				<div className="flex min-h-0 min-w-0 flex-col">
					<div className="flex min-w-0 shrink-0 items-start justify-between gap-4 sm:gap-6">
						<div className="min-w-0">
							<Skeleton className="h-9 w-36 sm:w-40" />
							<Skeleton className="mt-2 h-5 w-36 sm:w-44" />
						</div>

						<Skeleton className="h-10 w-28 shrink-0 sm:w-32" />
					</div>

					<div className="mt-4 grid shrink-0 grid-cols-3 gap-4 sm:gap-6">
						{["metric-1", "metric-2", "metric-3"].map((id) => (
							<div key={id} className="min-w-0">
								<Skeleton className="h-4 w-4/5 max-w-24" />
								<Skeleton className="mt-2 h-7 w-8" />
							</div>
						))}
					</div>

					<section className="mt-4 flex h-[32rem] min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card xl:h-auto xl:flex-1">
						<PanelHeaderSkeleton />

						<div className="scrollbar-thin min-h-0 flex-1 divide-y divide-border overflow-y-hidden">
							{TASK_ROWS.map((id) => (
								<TaskRowSkeleton key={id} />
							))}
						</div>
					</section>
				</div>

				<section className="flex h-[30rem] min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card xl:h-auto">
					<PanelHeaderSkeleton />

					<div className="scrollbar-thin min-h-0 flex-1 divide-y divide-border overflow-y-hidden">
						{ACTIVITY_ROWS.map((id) => (
							<ActivityRowSkeleton key={id} />
						))}
					</div>
				</section>
			</div>

			<section className="flex h-64 min-w-0 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
				<div className="flex shrink-0 items-center justify-between border-b border-primary bg-primary px-5 py-3">
					<Skeleton className="h-6 w-36 bg-primary-foreground/25" />
					<Skeleton className="h-3 w-12 bg-primary-foreground/25" />
				</div>

				<div className="flex min-h-0 min-w-0 flex-1 gap-3 overflow-hidden p-4 xl:grid xl:grid-cols-4 xl:gap-4">
					{PROJECT_CARDS.map((id) => (
						<RecentProjectSkeleton key={id} />
					))}
				</div>
			</section>
		</div>
	);
}
