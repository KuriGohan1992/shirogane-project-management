import { Skeleton } from "@/components/ui/skeleton";

const MEMBER_CARDS = [
	"member-1",
	"member-2",
	"member-3",
	"member-4",
	"member-5",
	"member-6",
];

const PROJECT_ROWS = ["project-1", "project-2", "project-3"];

function TeamMemberCardSkeleton() {
	return (
		<div className="flex min-h-44 flex-col rounded-xl border border-border bg-card p-5">
			<div className="flex items-start gap-3">
				<Skeleton className="size-11 shrink-0 rounded-full" />

				<div className="min-w-0 flex-1">
					<Skeleton className="h-4 w-36" />

					<Skeleton className="mt-2 h-3.5 w-44" />
				</div>

				<Skeleton className="mt-1 size-4" />
			</div>

			<div className="mt-4 border-t border-border pt-4">
				<div className="flex items-center gap-2">
					<Skeleton className="h-3 w-24" />

					<Skeleton className="h-3 w-4" />
				</div>

				<div className="mt-3 space-y-3">
					{PROJECT_ROWS.map((project) => (
						<div key={project} className="flex items-center gap-2">
							<Skeleton className="size-2.5 shrink-0 rounded-full" />

							<Skeleton className="h-3.5 flex-1" />

							<Skeleton className="h-3 w-12" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default function TeamLoading() {
	return (
		<div className="space-y-4">
			<div>
				<Skeleton className="h-9 w-28" />

				<Skeleton className="mt-1.5 h-5 w-52" />
			</div>

			<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
				<Skeleton className="h-9 w-full lg:max-w-md lg:flex-1" />

				<Skeleton className="h-8 w-full sm:w-56" />
			</div>

			<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				{MEMBER_CARDS.map((member) => (
					<TeamMemberCardSkeleton key={member} />
				))}
			</div>
		</div>
	);
}
