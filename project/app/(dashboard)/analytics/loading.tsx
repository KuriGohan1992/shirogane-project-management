import { Skeleton } from "@/components/ui/skeleton";

const METRICS = ["metric-1", "metric-2", "metric-3", "metric-4"];

const PROJECT_ROWS = ["project-1", "project-2", "project-3", "project-4"];

const PRIORITY_ROWS = [
	"priority-1",
	"priority-2",
	"priority-3",
	"priority-4",
	"priority-5",
];

const CONTRIBUTOR_ROWS = [
	"contributor-1",
	"contributor-2",
	"contributor-3",
	"contributor-4",
	"contributor-5",
	"contributor-6",
];

function PanelHeaderSkeleton({ width }: { width: string }) {
	return (
		<div className="border-b border-primary bg-primary px-5 py-3">
			<Skeleton className={`h-6 ${width} bg-primary-foreground/25`} />
		</div>
	);
}

export default function AnalyticsLoading() {
	return (
		<div className="space-y-5 pb-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<Skeleton className="h-9 w-36" />

					<Skeleton className="mt-2 h-5 w-80 max-w-full" />
				</div>

				<div className="flex gap-2">
					<Skeleton className="h-8 w-36" />

					<Skeleton className="h-8 w-48" />
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{METRICS.map((id) => (
					<div
						key={id}
						className="rounded-xl border border-border bg-card px-5 py-4"
					>
						<Skeleton className="h-4 w-32" />

						<Skeleton className="mt-2 h-8 w-20" />

						<Skeleton className="mt-2 h-3 w-40" />
					</div>
				))}
			</div>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.45fr)]">
				<section className="overflow-hidden rounded-xl border border-border bg-card">
					<PanelHeaderSkeleton width="w-36" />

					<div className="p-5">
						<Skeleton className="h-4 w-80 max-w-full" />

						<div className="mt-5 flex h-64 items-end gap-2 border-b border-border">
							{Array.from(
								{
									length: 12,
								},
								(_, index) => `bar-${index}`,
							).map((id, index) => (
								<Skeleton
									key={id}
									className="min-w-0 flex-1 rounded-b-none"
									style={{
										height: `${25 + ((index * 19) % 65)}%`,
									}}
								/>
							))}
						</div>
					</div>
				</section>

				<section className="overflow-hidden rounded-xl border border-border bg-card">
					<PanelHeaderSkeleton width="w-24" />

					<div className="p-5">
						<Skeleton className="mx-auto h-52 w-52 rounded-full" />

						<div className="mt-3 space-y-3">
							{["health-1", "health-2", "health-3"].map((id) => (
								<div key={id} className="flex items-center gap-2">
									<Skeleton className="size-2.5 rounded-full" />

									<Skeleton className="h-3 w-20" />

									<Skeleton className="ml-auto h-3 w-6" />
								</div>
							))}
						</div>
					</div>
				</section>
			</div>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
				<section className="overflow-hidden rounded-xl border border-border bg-card">
					<PanelHeaderSkeleton width="w-32" />

					<div className="space-y-5 p-5">
						{PROJECT_ROWS.map((id) => (
							<div key={id}>
								<div className="flex items-center gap-2">
									<Skeleton className="size-2.5 rounded-full" />

									<Skeleton className="h-4 w-40" />

									<Skeleton className="ml-auto h-4 w-10" />
								</div>

								<Skeleton className="mt-2 h-3 w-36" />

								<Skeleton className="mt-2 h-2 w-full rounded-full" />
							</div>
						))}
					</div>
				</section>

				<section className="overflow-hidden rounded-xl border border-border bg-card">
					<PanelHeaderSkeleton width="w-40" />

					<div className="space-y-5 p-5">
						{PRIORITY_ROWS.map((id) => (
							<div key={id}>
								<div className="flex items-center gap-2">
									<Skeleton className="size-2.5 rounded-full" />

									<Skeleton className="h-4 w-20" />

									<Skeleton className="ml-auto h-3 w-16" />
								</div>

								<Skeleton className="mt-2 h-2 w-full rounded-full" />
							</div>
						))}
					</div>
				</section>
			</div>

			<section className="overflow-hidden rounded-xl border border-border bg-card">
				<PanelHeaderSkeleton width="w-44" />

				<div className="grid gap-x-8 gap-y-5 p-5 md:grid-cols-2">
					{CONTRIBUTOR_ROWS.map((id) => (
						<div key={id}>
							<div className="flex items-center gap-3">
								<Skeleton className="h-3 w-4" />

								<Skeleton className="size-9 rounded-full" />

								<div className="min-w-0 flex-1">
									<Skeleton className="h-4 w-32" />

									<Skeleton className="mt-1.5 h-3 w-24" />
								</div>

								<Skeleton className="h-7 w-12" />
							</div>

							<Skeleton className="mt-2 ml-16 h-1.5 w-3/4 rounded-full" />
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
