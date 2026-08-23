import type { NotificationType } from "@/lib/constants/notifications";
import { getTaskHref } from "@/lib/task-route";
import type { NotificationItem } from "@/types/notification";

const NOTIFICATION_CATEGORY: Record<NotificationType, string> = {
	project_member_added: "Project",
	project_member_removed: "Project",
	project_member_role_changed: "Project",

	task_assigned: "Assignment",
	task_unassigned: "Assignment",
	tasks_assigned: "Assignment",
	tasks_unassigned: "Assignment",

	task_comment_added: "Comment",

	task_due_soon: "Deadline",
};

function getActorName(notification: NotificationItem) {
	if (!notification.actor) {
		return "Shiro";
	}

	return notification.actor.name?.trim() || notification.actor.email;
}

function formatRole(role: string) {
	return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatDueDate(value: string) {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export function getNotificationCategory(notification: NotificationItem) {
	return NOTIFICATION_CATEGORY[notification.type];
}

export function getNotificationMessage(notification: NotificationItem) {
	const actor = getActorName(notification);

	switch (notification.type) {
		case "project_member_added":
			return `${actor} added you to ${notification.metadata.projectName} as ${formatRole(notification.metadata.role)}.`;

		case "project_member_removed":
			return `${actor} removed you from ${notification.metadata.projectName}.`;

		case "project_member_role_changed":
			return `${actor} changed your role in ${notification.metadata.projectName} from ${formatRole(notification.metadata.previousRole)} to ${formatRole(notification.metadata.role)}.`;

		case "task_assigned":
			return `${actor} assigned you "${notification.metadata.taskTitle}" in ${notification.metadata.projectName}.`;

		case "task_unassigned":
			return `${actor} unassigned you from "${notification.metadata.taskTitle}" in ${notification.metadata.projectName}.`;

		case "tasks_assigned":
			return `${actor} assigned you to ${notification.metadata.taskCount} tasks in ${notification.metadata.projectName}.`;

		case "tasks_unassigned":
			return `${actor} unassigned you from ${notification.metadata.taskCount} tasks in ${notification.metadata.projectName}.`;

		case "task_comment_added":
			return `${actor} commented on "${notification.metadata.taskTitle}" in ${notification.metadata.projectName}.`;

		case "task_due_soon":
			return `"${notification.metadata.taskTitle}" in ${notification.metadata.projectName} is due ${formatDueDate(notification.metadata.dueDate)}.`;
	}
}

export function getNotificationHref(notification: NotificationItem) {
	switch (notification.type) {
		case "project_member_removed":
			/*
			 * They no longer have access to that project.
			 */
			return "/projects";

		case "project_member_added":
		case "project_member_role_changed":
		case "tasks_assigned":
		case "tasks_unassigned":
			return notification.projectId
				? `/projects/${notification.projectId}`
				: null;

		case "task_assigned":
		case "task_unassigned":
		case "task_comment_added":
		case "task_due_soon":
			if (!notification.projectId || !notification.taskId) {
				return notification.projectId
					? `/projects/${notification.projectId}`
					: null;
			}

			return getTaskHref(
				notification.projectId,
				notification.taskId,
				notification.metadata.taskTitle,
			);
	}
}
