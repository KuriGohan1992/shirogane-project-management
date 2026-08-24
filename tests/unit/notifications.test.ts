import { describe, expect, it } from "vitest";

import {
	getNotificationCategory,
	getNotificationHref,
	getNotificationMessage,
} from "@/lib/notification-display";
import { isNotificationAllowed } from "@/lib/notifications";
import type { NotificationItem } from "@/types/notification";

function notification(
	overrides: Partial<NotificationItem> & {
		type: NotificationItem["type"];
		metadata: NotificationItem["metadata"];
	},
): NotificationItem {
	return {
		id: "notification",
		actor: {
			id: "actor",
			name: "Alex",
			email: "alex@shiro.test",
			imageUrl: null,
		},
		projectId: "project-1",
		taskId: "task-1",
		readAt: null,
		createdAt: "2026-08-25T00:00:00.000Z",
		...overrides,
	} as NotificationItem;
}

describe("notification preferences", () => {
	it("allows notifications when no preferences are loaded", () => {
		expect(isNotificationAllowed(undefined, "task_assigned")).toBe(true);
	});

	it("blocks every notification when globally muted", () => {
		expect(
			isNotificationAllowed(
				{ notificationsMuted: true, mutedCategories: [] },
				"task_due_soon",
			),
		).toBe(false);
	});

	it("blocks only muted categories", () => {
		const preferences = {
			notificationsMuted: false,
			mutedCategories: ["comments"] as const,
		};

		expect(
			isNotificationAllowed(
				{
					...preferences,
					mutedCategories: [...preferences.mutedCategories],
				},
				"task_comment_added",
			),
		).toBe(false);
		expect(
			isNotificationAllowed(
				{
					...preferences,
					mutedCategories: [...preferences.mutedCategories],
				},
				"task_assigned",
			),
		).toBe(true);
	});
});

describe("notification display", () => {
	it("formats project membership notifications", () => {
		const item = notification({
			type: "project_member_added",
			taskId: null,
			metadata: {
				projectName: "Shiro",
				role: "member",
			},
		});

		expect(getNotificationCategory(item)).toBe("Project");
		expect(getNotificationMessage(item)).toBe(
			"Alex added you to Shiro as Member.",
		);
		expect(getNotificationHref(item)).toBe("/projects/project-1");
	});

	it("uses Shiro as the actor for system-generated reminders", () => {
		const item = notification({
			type: "task_due_soon",
			actor: null,
			metadata: {
				projectName: "Shiro",
				taskTitle: "Ship MVP",
				dueDate: "2026-08-25T00:00:00.000Z",
			},
		});

		expect(getNotificationCategory(item)).toBe("Deadline");
		expect(getNotificationMessage(item)).toBe(
			'"Ship MVP" in Shiro is due Aug 25, 2026.',
		);
		expect(getNotificationHref(item)).toBe(
			"/projects/project-1/tasks/task-1/ship-mvp",
		);
	});

	it("sends removed collaborators back to the project list", () => {
		const item = notification({
			type: "project_member_removed",
			taskId: null,
			metadata: {
				projectName: "Shiro",
			},
		});

		expect(getNotificationHref(item)).toBe("/projects");
	});

	it("falls back to the project when a task id is missing", () => {
		const item = notification({
			type: "task_comment_added",
			taskId: null,
			metadata: {
				projectName: "Shiro",
				taskTitle: "Ship MVP",
			},
		});

		expect(getNotificationHref(item)).toBe("/projects/project-1");
	});
});
