import { Skeleton } from "@/components/ui/skeleton";

const PRIORITY_ROWS = [
	"priority-1",
	"priority-2",
	"priority-3",
	"priority-4",
	"priority-5",
];

const PROJECT_ROWS = ["project-1", "project-2", "project-3", "project-4"];

const COLLABORATOR_ROWS = [
	"collaborator-1",
	"collaborator-2",
	"collaborator-3",
	"collaborator-4",
	"collaborator-5",
];

function PanelHeaderSkeleton({ width = "w-36" }: { width?: string }) {
	return (
		<div className="shrink-0 border-b border-primary bg-primary px-5 py-3">
			<Skeleton className={`h-6 ${width} bg-primary-foreground/25`} />
		</div>
	);
}

function MetricSkeleton({
	labelWidth,
	valueWidth,
	detailWidth,
}: {
	labelWidth: string;
	valueWidth: string;
	detailWidth: string;
}) {
	return (
		<div className="min-w-0">
			<Skeleton className={`h-4 ${labelWidth}`} />

			<div className="mt-2 flex items-center gap-2">
				<Skeleton className={`h-7 ${valueWidth}`} />
				<Skeleton className="h-3 w-12" />
			</div>

			<Skeleton className={`mt-2 h-3 ${detailWidth}`} />
		</div>
	);
}

function CompletionTrendSkeleton() {
	return (
		<section className="flex min-h-[18rem] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
			<PanelHeaderSkeleton width="w-40" />

			<div className="flex min-h-0 flex-1 flex-col p-4">
				<div className="mb-4 flex justify-end gap-4">
					<div className="flex items-center gap-2">
						<Skeleton className="size-2 rounded-full" />
						<Skeleton className="h-3 w-12" />
					</div>

					<div className="flex items-center gap-2">
						<Skeleton className="size-2 rounded-full" />
						<Skeleton className="h-3 w-16" />
					</div>
				</div>

				<div className="relative min-h-0 flex-1">
					<div className="absolute inset-0 flex flex-col justify-between">
						{["line-1", "line-2", "line-3", "line-4"].map((id) => (
							<div key={id} className="border-t border-dashed border-border" />
						))}
					</div>

					<div className="absolute inset-x-8 bottom-3 flex items-end gap-2">
						<Skeleton className="h-14 flex-1 rounded-sm" />
						<Skeleton className="h-9 flex-1 rounded-sm" />
						<Skeleton className="h-20 flex-1 rounded-sm" />
						<Skeleton className="h-12 flex-1 rounded-sm" />
						<Skeleton className="h-24 flex-1 rounded-sm" />
						<Skeleton className="h-16 flex-1 rounded-sm" />
						<Skeleton className="h-28 flex-1 rounded-sm" />
						<Skeleton className="h-10 flex-1 rounded-sm" />
					</div>
				</div>
			</div>
		</section>
	);
}

function TaskHealthSkeleton() {
	return (
		<section className="shrink-0 overflow-hidden rounded-xl border border-border bg-card">
			<PanelHeaderSkeleton width="w-24" />

			<div className="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-5 px-4 py-4">
				<div className="flex h-32 items-center justify-center">
					<div className="relative">
						<Skeleton className="size-28 rounded-full" />
						<div className="absolute inset-4 rounded-full bg-card" />
						<Skeleton className="absolute left-1/2 top-1/2 h-5 w-10 -translate-x-1/2 -translate-y-3" />
						<Skeleton className="absolute left-1/2 top-1/2 mt-2 h-3 w-8 -translate-x-1/2" />
					</div>
				</div>

				<div className="space-y-3">
					{["health-1", "health-2", "health-3"].map((id) => (
						<div key={id} className="flex items-center gap-2.5">
							<Skeleton className="size-2.5 shrink-0 rounded-full" />
							<Skeleton className="h-3 flex-1" />
							<Skeleton className="h-3 w-7 shrink-0" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function PrioritySkeleton() {
	return (
		<section className="shrink-0 overflow-hidden rounded-xl border border-border bg-card">
			<PanelHeaderSkeleton width="w-40" />

			<div className="space-y-3 p-4">
				{PRIORITY_ROWS.map((id, index) => (
					<div key={id}>
						<div className="mb-1.5 flex items-center justify-between gap-4">
							<div className="flex items-center gap-2">
								<Skeleton className="size-2.5 rounded-full" />
								<Skeleton className={index === 4 ? "h-3 w-16" : "h-3 w-12"} />
							</div>

							<Skeleton className="h-3 w-14" />
						</div>

						<Skeleton
							className={`h-2 rounded-full ${
								index === 0
									? "w-1/4"
									: index === 1
										? "w-1/3"
										: index === 2
											? "w-1/2"
											: index === 3
												? "w-2/5"
												: "w-1/4"
							}`}
						/>
					</div>
				))}
			</div>
		</section>
	);
}

function ProjectProgressSkeleton() {
	return (
		<section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
			<div className="flex shrink-0 items-center gap-2 border-b border-primary bg-primary px-5 py-3">
				<Skeleton className="h-6 w-36 bg-primary-foreground/25" />
				<Skeleton className="size-4 bg-primary-foreground/25" />

				<div className="ml-auto flex items-center gap-2">
					<Skeleton className="h-3 w-24 bg-primary-foreground/25" />
					<Skeleton className="size-4 rounded-sm bg-primary-foreground/25" />
				</div>
			</div>

			<div className="min-h-0 flex-1 divide-y divide-border overflow-hidden px-4">
				{PROJECT_ROWS.map((id, index) => (
					<div key={id} className="py-3">
						<div className="flex items-start gap-3">
							<Skeleton className="mt-1 size-2.5 shrink-0 rounded-full" />

							<div className="min-w-0 flex-1">
								<Skeleton
									className={`h-4 ${index % 2 === 0 ? "w-44" : "w-36"}`}
								/>

								<Skeleton className="mt-2 h-3 w-32" />
							</div>

							<Skeleton className="h-4 w-10" />
						</div>

						<Skeleton
							className={`mt-2 h-2 rounded-full ${
								index === 0
									? "w-3/5"
									: index === 1
										? "w-2/5"
										: index === 2
											? "w-1/3"
											: "w-1/4"
							}`}
						/>
					</div>
				))}
			</div>
		</section>
	);
}

function CollaboratorSkeleton() {
	return (
		<section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
			<PanelHeaderSkeleton width="w-52" />

			<div className="min-h-0 flex-1 divide-y divide-border overflow-hidden">
				{COLLABORATOR_ROWS.map((id, index) => (
					<div
						key={id}
						className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 px-4 py-2.5"
					>
						<div className="flex items-center gap-1">
							<Skeleton className="h-3 w-5" />
							<Skeleton className="size-8 rounded-full" />
						</div>

						<div className="min-w-0">
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<Skeleton
										className={`h-4 ${index % 2 === 0 ? "w-28" : "w-24"}`}
									/>

									<Skeleton className="mt-1.5 h-3 w-24" />
								</div>

								<div className="shrink-0 text-right">
									<Skeleton className="ml-auto h-3 w-20" />
									<Skeleton className="mt-1.5 h-2.5 w-24" />
								</div>
							</div>

							<Skeleton
								className={`mt-1.5 h-1 rounded-full ${
									index === 0
										? "w-full"
										: index === 1
											? "w-3/4"
											: index === 2
												? "w-2/3"
												: index === 3
													? "w-1/2"
													: "w-1/3"
								}`}
							/>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export default function AnalyticsLoading() {
	return (
		<div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 xl:h-[calc(100vh-8rem)] xl:min-h-0 xl:overflow-hidden">
			<div className="grid shrink-0 gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(22rem,0.78fr)]">
				<div className="flex min-h-0 flex-col gap-4">
					<div className="shrink-0">
						<div>
							<Skeleton className="h-9 w-36" />
							<Skeleton className="mt-2 h-5 w-96 max-w-full" />
						</div>

						<div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-4">
							<MetricSkeleton
								labelWidth="w-28"
								valueWidth="w-10"
								detailWidth="w-20"
							/>

							<MetricSkeleton
								labelWidth="w-32"
								valueWidth="w-14"
								detailWidth="w-28"
							/>

							<MetricSkeleton
								labelWidth="w-28"
								valueWidth="w-12"
								detailWidth="w-32"
							/>

							<MetricSkeleton
								labelWidth="w-32"
								valueWidth="w-8"
								detailWidth="w-20"
							/>
						</div>
					</div>

					<CompletionTrendSkeleton />
				</div>

				<div className="flex flex-col gap-4">
					<div className="flex shrink-0 justify-end gap-2">
						<Skeleton className="h-8 w-32 rounded-md" />
						<Skeleton className="h-8 w-36 rounded-md" />
					</div>

					<TaskHealthSkeleton />

					<PrioritySkeleton />
				</div>
			</div>

			<div className="grid min-h-[17rem] flex-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
				<ProjectProgressSkeleton />

				<CollaboratorSkeleton />
			</div>
		</div>
	);
}
