import { Skeleton } from "@/components/ui/skeleton";

const PROJECT_SKELETONS = [
	"project-1",
	"project-2",
	"project-3",
	"project-4",
	"project-5",
	"project-6",
];

function ProjectCardSkeleton() {
	return (
		<div className="relative flex h-[15rem] overflow-hidden rounded-xl border border-border bg-card">
			<Skeleton className="absolute inset-x-0 top-0 h-4 rounded-none" />

			<div className="flex min-h-0 w-full flex-col px-5 pb-4 pt-7">
				<div className="flex h-5 items-center justify-between">
					<Skeleton className="h-3 w-12" />
					<Skeleton className="h-4 w-1.5" />
				</div>

				<Skeleton className="mt-3 h-5 w-3/4" />

				<div className="mt-3 space-y-2">
					<Skeleton className="h-3.5 w-full" />
					<Skeleton className="h-3.5 w-4/5" />
				</div>

				<div className="mt-auto border-t border-border pt-3">
					<div className="flex items-center gap-2">
						<Skeleton className="size-4 shrink-0" />
						<Skeleton className="h-3.5 w-36" />
					</div>

					<div className="mt-2 flex items-center gap-2">
						<Skeleton className="size-4 shrink-0 rounded-full" />
						<Skeleton className="h-3.5 w-40" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ProjectsLoading() {
	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<Skeleton className="h-9 w-36" />
					<Skeleton className="mt-1.5 h-5 w-20" />
				</div>

				<Skeleton className="h-10 w-32" />
			</div>

			<div className="space-y-4">
				<div className="flex flex-col gap-3 xl:flex-row xl:items-center">
					<Skeleton className="h-9 w-full xl:min-w-48 xl:flex-1" />

					<div className="flex shrink-0 flex-wrap items-center gap-2 xl:flex-nowrap">
						<Skeleton className="h-8 w-28" />
						<Skeleton className="h-8 w-32" />
						<Skeleton className="h-8 w-32" />
						<Skeleton className="h-8 w-42" />
						<Skeleton className="h-8 w-40" />
						<Skeleton className="size-8" />
					</div>
				</div>

				<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
					{PROJECT_SKELETONS.map((id) => (
						<ProjectCardSkeleton key={id} />
					))}
				</div>
			</div>
		</div>
	);
}
