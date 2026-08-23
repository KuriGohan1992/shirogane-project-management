import { Skeleton } from "@/components/ui/skeleton";

const STAGES = ["stage-1", "stage-2", "stage-3"];

const TASKS = ["task-1", "task-2"];

function ProjectHeaderSkeleton() {
	return (
		<div className="relative overflow-hidden rounded-xl border border-border bg-card">
			<Skeleton className="absolute inset-x-0 top-0 h-4 rounded-none" />

			<div className="p-6 pt-7">
				<div className="flex items-start justify-between gap-4">
					<Skeleton className="h-9 w-[min(28rem,55%)]" />

					<div className="flex shrink-0 items-center gap-2">
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-6 w-px rounded-none" />
						<Skeleton className="h-5 w-2" />
					</div>
				</div>

				<div className="mt-4 max-w-5xl space-y-2">
					<Skeleton className="h-3.5 w-full" />
					<Skeleton className="h-3.5 w-4/5" />
				</div>

				<div className="mt-5 grid grid-cols-3 divide-x divide-border border-t border-border pt-4">
					{["schedule", "activity", "role"].map((id, index) => (
						<div
							key={id}
							className={
								index === 0
									? "flex items-center gap-3 pr-4"
									: "flex items-center gap-3 px-4"
							}
						>
							<Skeleton className="size-[18px] shrink-0" />

							<div>
								<Skeleton className="h-3 w-20" />
								<Skeleton className="mt-1.5 h-4 w-32" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function TaskSkeleton() {
	return (
		<div className="rounded-xl border border-border bg-card px-4 pb-3 pt-4">
			<div className="flex items-start justify-between">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-4 w-1.5" />
			</div>

			<Skeleton className="mt-3 h-3 w-24" />

			<div className="mt-4 flex items-center justify-between">
				<Skeleton className="h-5 w-16 rounded-full" />
				<Skeleton className="h-3 w-24" />
			</div>

			<div className="mt-3 border-t border-border pt-3">
				<div className="flex items-center justify-between">
					<div className="flex -space-x-1.5">
						<Skeleton className="size-6 rounded-full" />
						<Skeleton className="size-6 rounded-full" />
					</div>

					<Skeleton className="h-4 w-10" />
				</div>
			</div>
		</div>
	);
}

function StageSkeleton({ taskCount = 2 }: { taskCount?: number }) {
	return (
		<div className="w-[min(20rem,85vw)] shrink-0 rounded-xl border border-border bg-muted/40">
			<div className="flex min-h-14 items-center justify-between border-b border-border px-4 py-3">
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-5 w-7" />
				</div>

				<Skeleton className="h-5 w-2" />
			</div>

			<div className="space-y-3 p-3">
				{TASKS.slice(0, taskCount).map((id) => (
					<TaskSkeleton key={id} />
				))}

				<Skeleton className="ml-2 h-5 w-24" />
			</div>
		</div>
	);
}

export default function ProjectLoading() {
	return (
		<div className="space-y-6">
			<ProjectHeaderSkeleton />

			<section>
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
					<Skeleton className="h-9 w-full lg:max-w-sm" />

					<div className="flex flex-wrap items-center gap-2">
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-20" />
						<Skeleton className="h-8 w-28" />
						<Skeleton className="h-8 w-28" />
					</div>

					<Skeleton className="h-8 w-28 lg:ml-auto" />
				</div>

				<Skeleton className="mt-3 h-4 w-16" />

				<div className="mt-3 flex gap-4 overflow-hidden">
					{STAGES.map((id, index) => (
						<StageSkeleton key={id} taskCount={index === 1 ? 1 : 2} />
					))}

					<Skeleton className="h-12 w-32 shrink-0 border border-dashed border-border bg-transparent" />
				</div>
			</section>
		</div>
	);
}
