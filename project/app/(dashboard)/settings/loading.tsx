import { Skeleton } from "@/components/ui/skeleton";

const NOTIFICATION_ROWS = [
	"mute-all",
	"project-access",
	"assignments",
	"comments",
	"due-reminders",
];

const APPEARANCE_OPTIONS = ["light", "dark", "system"];

function SettingsHeaderSkeleton({
	width = "w-28",
}: {
	width?: string;
}) {
	return (
		<div className="shrink-0 border-b border-primary bg-primary px-5 py-3">
			<Skeleton
				className={`h-6 ${width} bg-primary-foreground/25`}
			/>
		</div>
	);
}

function ProfileSkeleton() {
	return (
		<section className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
			<SettingsHeaderSkeleton width="w-20" />

			<div className="flex-1 p-5">
				<div className="flex items-center gap-3">
					<Skeleton className="size-11 shrink-0 rounded-full" />

					<div className="min-w-0 flex-1">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="mt-1.5 h-3 w-44" />
					</div>

					<Skeleton className="h-8 w-24 shrink-0" />
				</div>

				<div className="mt-4 grid gap-3 sm:grid-cols-2">
					<div>
						<Skeleton className="h-3 w-16" />
						<Skeleton className="mt-1.5 h-9 w-full rounded-md" />
					</div>

					<div>
						<Skeleton className="h-3 w-16" />
						<Skeleton className="mt-1.5 h-9 w-full rounded-md" />
					</div>
				</div>

				<div className="mt-4">
					<Skeleton className="h-3 w-14" />
					<Skeleton className="mt-1.5 h-9 w-full rounded-md" />
				</div>

				<div className="mt-4">
					<Skeleton className="h-3 w-10" />
					<Skeleton className="mt-1.5 h-9 w-full rounded-md" />
				</div>

				<div className="mt-4 flex justify-end">
					<Skeleton className="h-8 w-16 rounded-md" />
				</div>
			</div>
		</section>
	);
}

function NotificationsSkeleton() {
	return (
		<section className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
			<SettingsHeaderSkeleton width="w-32" />

			<div className="flex flex-1 flex-col p-5">
				<div className="divide-y divide-border">
					{NOTIFICATION_ROWS.map((id, index) => (
						<div
							key={id}
							className="flex min-h-14 items-center justify-between gap-6 py-2"
						>
							<Skeleton
								className={
									index === 0 ? "h-4 w-36" : "h-4 w-24"
								}
							/>

							<Skeleton className="h-5 w-9 shrink-0 rounded-full" />
						</div>
					))}
				</div>

				<div className="mt-auto flex min-h-12 items-end justify-end border-t border-border pt-3">
					<Skeleton className="h-8 w-16 rounded-md" />
				</div>
			</div>
		</section>
	);
}

function SecuritySkeleton() {
	return (
		<section className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
			<SettingsHeaderSkeleton width="w-20" />

			<div className="flex flex-1 items-center gap-4 p-5">
				<div className="min-w-0 flex-1">
					<Skeleton className="h-4 w-48" />
					<Skeleton className="mt-2 h-3 w-64 max-w-full" />
				</div>

				<Skeleton className="h-8 w-32 shrink-0 rounded-md" />
			</div>
		</section>
	);
}

function AppearanceSkeleton() {
	return (
		<section className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
			<SettingsHeaderSkeleton width="w-28" />

			<div className="flex-1 p-5">
				<div className="grid h-full grid-cols-3 gap-3">
					{APPEARANCE_OPTIONS.map((id) => (
						<div
							key={id}
							className="flex h-14 items-center gap-3 rounded-lg border border-border px-4"
						>
							<Skeleton className="size-4 shrink-0 rounded-sm" />
							<Skeleton className="h-4 w-12" />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export default function SettingsLoading() {
	return (
		<div className="space-y-5 pb-6">
			<div>
				<Skeleton className="h-9 w-32" />
				<Skeleton className="mt-2 h-5 w-64" />
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<ProfileSkeleton />
				<NotificationsSkeleton />
				<SecuritySkeleton />
				<AppearanceSkeleton />
			</div>
		</div>
	);
}