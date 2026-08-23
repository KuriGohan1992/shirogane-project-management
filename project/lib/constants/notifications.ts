import type { ProjectMemberRoleValue } from "@/lib/constants/project-roles";

export const NOTIFICATION_TYPE_VALUES = [
	"project_member_added",
	"project_member_removed",
	"project_member_role_changed",

	"task_assigned",
	"task_unassigned",
	"tasks_assigned",
	"tasks_unassigned",
	"task_comment_added",
	"task_due_soon",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPE_VALUES)[number];

export type NotificationMetadataByType = {
	project_member_added: {
		projectName: string;
		role: ProjectMemberRoleValue;
	};

	project_member_removed: {
		projectName: string;
	};

	project_member_role_changed: {
		projectName: string;
		previousRole: ProjectMemberRoleValue;
		role: ProjectMemberRoleValue;
	};

	task_assigned: {
		projectName: string;
		taskTitle: string;
	};

	task_unassigned: {
		projectName: string;
		taskTitle: string;
	};

	tasks_assigned: {
		projectName: string;
		taskCount: number;
	};

	tasks_unassigned: {
		projectName: string;
		taskCount: number;
	};

	task_comment_added: {
		projectName: string;
		taskTitle: string;
	};

	task_due_soon: {
		projectName: string;
		taskTitle: string;
		dueDate: string;
	};
};

export type NotificationMetadata = NotificationMetadataByType[NotificationType];

export type CreateNotificationInput<
	T extends NotificationType = NotificationType,
> = {
	type: T;
	recipientId: string;
	actorId?: string | null;
	projectId?: string | null;
	taskId?: string | null;
	dedupeKey?: string | null;
	metadata: NotificationMetadataByType[T];
};

export type AnyCreateNotificationInput = {
	[T in NotificationType]: CreateNotificationInput<T>;
}[NotificationType];
