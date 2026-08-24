import type { ActivityWithActor } from "@/types/activity";

export function formatActivityDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

function formatRole(role: string | undefined) {
	if (!role) {
		return undefined;
	}

	return role.charAt(0).toUpperCase() + role.slice(1);
}

function getTaskName(activity: ActivityWithActor) {
	return activity.metadata.taskTitle
		? `“${activity.metadata.taskTitle}”`
		: "a task";
}

export function getActivityMessage(activity: ActivityWithActor) {
	const metadata = activity.metadata;

	const taskName = getTaskName(activity);

	switch (activity.action) {
		case "project_created":
			return "created this project";

		case "project_updated":
			return metadata.changedFields
				? `updated project ${metadata.changedFields}`
				: "updated the project";

		case "project_completed":
			return "marked this project as completed";

		case "project_reactivated":
			return "marked this project as active";

		case "stage_created":
			return metadata.stageName
				? `created the ${metadata.stageName} stage`
				: "created a stage";

		case "stage_renamed":
			if (metadata.previousStageName && metadata.stageName) {
				return `renamed the ${metadata.previousStageName} stage to ${metadata.stageName}`;
			}

			return metadata.stageName
				? `renamed a stage to ${metadata.stageName}`
				: "renamed a stage";

		case "stage_deleted":
			return metadata.stageName
				? `deleted the ${metadata.stageName} stage`
				: "deleted a stage";

		case "stage_reordered":
			return metadata.stageName
				? `reordered the ${metadata.stageName} stage`
				: "reordered the stages";

		case "member_added":
			return metadata.memberName
				? `added ${metadata.memberName} to the project`
				: "added a project collaborator";

		case "member_role_updated": {
			const previousRole = formatRole(metadata.previousMemberRole);

			const nextRole = formatRole(metadata.memberRole);

			if (metadata.memberName && previousRole && nextRole) {
				return `changed ${metadata.memberName} from ${previousRole} to ${nextRole}`;
			}

			return metadata.memberName
				? `changed ${metadata.memberName}’s project role`
				: "changed a project collaborator’s role";
		}

		case "member_removed":
			return metadata.memberName
				? `removed ${metadata.memberName} from the project`
				: "removed a project collaborator";

		case "label_created":
			return metadata.labelName
				? `created the ${metadata.labelName} label`
				: "created a project label";

		case "label_updated":
			if (metadata.previousLabelName && metadata.labelName) {
				return metadata.previousLabelName !== metadata.labelName
					? `updated the ${metadata.previousLabelName} label to ${metadata.labelName}`
					: `updated the ${metadata.labelName} label`;
			}

			return metadata.labelName
				? `updated the ${metadata.labelName} label`
				: "updated a project label";

		case "label_deleted":
			return metadata.labelName
				? `deleted the ${metadata.labelName} label`
				: "deleted a project label";

		case "task_created":
			return metadata.stageName
				? `created ${taskName} in ${metadata.stageName}`
				: `created ${taskName}`;

		case "task_updated":
			return metadata.changedFields
				? `updated ${metadata.changedFields} on ${taskName}`
				: `updated ${taskName}`;

		case "task_moved":
			if (metadata.fromStage && metadata.toStage) {
				return `moved ${taskName} from ${metadata.fromStage} to ${metadata.toStage}`;
			}

			return `moved ${taskName}`;

		case "task_completed":
			return `completed ${taskName}`;

		case "task_reopened":
			return `reopened ${taskName}`;

		case "task_archived":
			return `archived ${taskName}`;

		case "task_restored":
			return `restored ${taskName}`;

		case "task_deleted":
			return `permanently deleted ${taskName}`;

		case "assignee_added":
			return metadata.assigneeName
				? `assigned ${metadata.assigneeName} to ${taskName}`
				: `added an assignee to ${taskName}`;

		case "assignee_removed":
			return metadata.assigneeName
				? `unassigned ${metadata.assigneeName} from ${taskName}`
				: `removed an assignee from ${taskName}`;

		case "label_added":
			return metadata.labelName
				? `added the ${metadata.labelName} label to ${taskName}`
				: `added a label to ${taskName}`;

		case "label_removed":
			return metadata.labelName
				? `removed the ${metadata.labelName} label from ${taskName}`
				: `removed a label from ${taskName}`;

		case "comment_added":
			return `commented on ${taskName}`;
	}
}
