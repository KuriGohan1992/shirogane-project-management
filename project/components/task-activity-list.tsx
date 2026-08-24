import { History } from "lucide-react";

import { UserAvatar } from "@/components/user-avatar";
import type { TaskActivityWithActor } from "@/types/activity";

function formatActivityDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

function getActivityMessage(activity: TaskActivityWithActor) {
	const metadata = activity.metadata;

	switch (activity.action) {
		case "task_created":
			return metadata.stageName
				? `created this task in ${metadata.stageName}`
				: "created this task";

		case "task_updated":
			return metadata.changedFields
				? `updated ${metadata.changedFields}`
				: "updated this task";

		case "task_moved":
			if (metadata.fromStage && metadata.toStage) {
				return `moved this task from ${metadata.fromStage} to ${metadata.toStage}`;
			}

			return "moved this task";

		case "task_completed":
			return "completed this task";

		case "task_reopened":
			return "reopened this task";

		case "task_archived":
			return "archived this task";

		case "task_restored":
			return "restored this task";

		case "task_deleted":
			return "permanently deleted this task";

		case "assignee_added":
			return metadata.assigneeName
				? `assigned ${metadata.assigneeName}`
				: "added an assignee";

		case "assignee_removed":
			return metadata.assigneeName
				? `unassigned ${metadata.assigneeName}`
				: "removed an assignee";

		case "label_added":
			return metadata.labelName
				? `added the ${metadata.labelName} label`
				: "added a label";

		case "label_removed":
			return metadata.labelName
				? `removed the ${metadata.labelName} label`
				: "removed a label";

		case "comment_added":
			return "commented on this task";
	}
}

export function TaskActivityList({
	activities,
}: {
	activities: TaskActivityWithActor[];
}) {
	return (
		<section>
			<div className="mb-4 flex items-center gap-2">
				<History
					aria-hidden="true"
					size={17}
					className="text-muted-foreground"
				/>

				<h2 className="text-sm font-semibold">Activity</h2>
			</div>

			{activities.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					No activity recorded yet.
				</p>
			) : (
				<div className="space-y-4">
					{activities.map((activity) => {
						const actorName =
							activity.actor?.name ?? activity.actor?.email ?? "Former member";

						return (
							<div key={activity.id} className="flex gap-3">
								{activity.actor ? (
									<UserAvatar
										user={activity.actor}
										className="size-7 shrink-0"
									/>
								) : (
									<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
										?
									</div>
								)}

								<div className="min-w-0 flex-1">
									<p className="text-sm leading-5 text-foreground/90">
										<span className="font-medium text-foreground">
											{actorName}
										</span>{" "}
										{getActivityMessage(activity)}
									</p>

									<time
										dateTime={activity.createdAt.toISOString()}
										className="mt-0.5 block text-xs text-muted-foreground"
									>
										{formatActivityDate(activity.createdAt)}
									</time>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}
