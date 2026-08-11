const SKELETON_IDS = [
	"project-skeleton-1",
	"project-skeleton-2",
	"project-skeleton-3",
	"project-skeleton-4",
	"project-skeleton-5",
	"project-skeleton-6",
];

export default function Loading() {
	return (
		<div className="space-y-6 animate-pulse">
			<div className="flex items-center justify-between">
				<div>
					<div className="h-9 w-36 rounded-md bg-muted" />
					<div className="mt-3 h-5 w-20 rounded-md bg-muted" />
				</div>

				<div className="h-10 w-32 rounded-lg bg-muted" />
			</div>

			<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				{SKELETON_IDS.map((id) => (
					<div
						key={id}
						className="h-64 rounded-xl border border-border bg-card p-5"
					>
						<div className="h-3 w-3 rounded-full bg-muted" />
						<div className="mt-5 h-6 w-2/3 rounded-md bg-muted" />
						<div className="mt-3 h-4 w-full rounded-md bg-muted" />
						<div className="mt-2 h-4 w-4/5 rounded-md bg-muted" />

						<div className="mt-8 border-t border-border pt-4">
							<div className="h-4 w-1/2 rounded-md bg-muted" />
							<div className="mt-3 h-4 w-2/3 rounded-md bg-muted" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
