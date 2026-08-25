import { Skeleton } from "@/components/ui/skeleton";

const MOBILE_DETAIL_SKELETONS = [
	"stage",
	"priority",
	"assignees",
	"start-date",
	"due-date",
] as const;

const DESKTOP_DETAIL_SKELETONS = [
	"stage",
	"priority",
	"assignees",
	"dates",
] as const;

export function TaskDetailsLoading() {
	return (
		<div className="flex h-[min(52rem,90dvh)] min-h-0 flex-col bg-background">
			<div className="shrink-0 bg-primary px-6 py-5 lg:px-8">
				<div className="space-y-3 pr-10">
					<Skeleton className="h-4 w-40 bg-primary-foreground/20" />
					<Skeleton className="h-8 w-2/3 bg-primary-foreground/25" />
				</div>
			</div>

			<div className="min-h-0 flex-1 overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
				<div className="space-y-8 overflow-hidden px-6 py-6 lg:px-8">
					<div>
						<Skeleton className="h-6 w-32" />
						<div className="mt-5 grid grid-cols-2 gap-6 xl:grid-cols-3">
							{MOBILE_DETAIL_SKELETONS.map((key) => (
								<div key={key} className="space-y-2">
									<Skeleton className="h-3 w-20" />
									<Skeleton className="h-6 w-28 max-w-full" />
								</div>
							))}
						</div>
					</div>

					<div className="space-y-3 border-t border-border pt-5">
						<Skeleton className="h-6 w-28" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				</div>

				<div className="hidden border-l border-border p-5 lg:block">
					<Skeleton className="h-6 w-28" />
					<div className="mt-5 space-y-4">
						{DESKTOP_DETAIL_SKELETONS.map((key) => (
							<div key={key} className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-12 w-full" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
