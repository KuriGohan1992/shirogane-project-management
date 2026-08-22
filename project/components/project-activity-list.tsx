import { History } from "lucide-react";

import { UserAvatar } from "@/components/user-avatar";
import { formatActivityDate, getActivityMessage } from "@/lib/activity-display";
import type { ActivityWithActor } from "@/types/activity";

export function ProjectActivityList({
	activities,
}: {
	activities: ActivityWithActor[];
}) {
	if (activities.length === 0) {
		return (
			<div className="flex min-h-64 flex-col items-center justify-center text-center">
				<History
					aria-hidden="true"
					size={24}
					className="text-muted-foreground"
				/>

				<p className="mt-3 text-sm font-medium">No activity recorded yet</p>

				<p className="mt-1 max-w-64 text-xs leading-5 text-muted-foreground">
					Changes to this project, its stages, tasks, members, and labels will
					appear here.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			{activities.map((activity) => {
				const actorName =
					activity.actor?.name ?? activity.actor?.email ?? "Former member";

				return (
					<div key={activity.id} className="flex gap-3">
						{activity.actor ? (
							<UserAvatar user={activity.actor} className="size-8 shrink-0" />
						) : (
							<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
								?
							</div>
						)}

						<div className="min-w-0 flex-1">
							<p className="text-sm leading-5 text-foreground/90">
								<span className="font-medium text-foreground">{actorName}</span>{" "}
								{getActivityMessage(activity)}
							</p>

							<time
								dateTime={activity.createdAt.toISOString()}
								className="mt-1 block text-xs text-muted-foreground"
							>
								{formatActivityDate(activity.createdAt)}
							</time>
						</div>
					</div>
				);
			})}
		</div>
	);
}
