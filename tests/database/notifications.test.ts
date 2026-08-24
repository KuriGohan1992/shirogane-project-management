import { describe, expect, it } from "vitest";

import {
	createNotificationRecords,
	getNotificationCenterDataForUser,
	markAllNotificationsReadForUser,
	markNotificationReadForUser,
} from "@/lib/db/notifications";
import { createTestProject, createTestUser } from "./helpers";

describe("notification persistence", () => {
	it("creates, reads, and marks notifications as read", async () => {
		const owner = await createTestUser("notification-owner");
		const recipient = await createTestUser("notification-recipient");
		const project = await createTestProject(owner.id, "Notifications");

		const [created] = await createNotificationRecords([
			{
				type: "project_member_added",
				recipientId: recipient.id,
				actorId: owner.id,
				projectId: project.id,
				metadata: {
					projectName: project.name,
					role: "member",
				},
			},
		]);

		if (!created) {
			throw new Error("Expected a notification.");
		}

		let center = await getNotificationCenterDataForUser(recipient.id);

		expect(center.unreadCount).toBe(1);
		expect(center.items[0]).toMatchObject({
			id: created.id,
			type: "project_member_added",
			projectId: project.id,
			readAt: null,
		});

		expect(
			await markNotificationReadForUser(created.id, recipient.id),
		).toMatchObject({ id: created.id });

		center = await getNotificationCenterDataForUser(recipient.id);
		expect(center.unreadCount).toBe(0);
		expect(center.items[0]?.readAt).not.toBeNull();
	});

	it("deduplicates notifications by recipient and dedupe key", async () => {
		const owner = await createTestUser("dedupe-owner");
		const recipient = await createTestUser("dedupe-recipient");
		const project = await createTestProject(owner.id, "Dedupe");

		const input = {
			type: "task_due_soon" as const,
			recipientId: recipient.id,
			actorId: null,
			projectId: project.id,
			taskId: null,
			dedupeKey: "due:one",
			metadata: {
				projectName: project.name,
				taskTitle: "Task",
				dueDate: "2026-08-25T00:00:00.000Z",
			},
		};

		expect(await createNotificationRecords([input])).toHaveLength(1);
		expect(await createNotificationRecords([input])).toHaveLength(0);
	});

	it("marks all unread notifications for one recipient only", async () => {
		const owner = await createTestUser("mark-all-owner");
		const recipient = await createTestUser("mark-all-recipient");
		const other = await createTestUser("mark-all-other");
		const project = await createTestProject(owner.id, "Mark all");

		await createNotificationRecords([
			{
				type: "project_member_removed",
				recipientId: recipient.id,
				actorId: owner.id,
				projectId: project.id,
				metadata: { projectName: project.name },
			},
			{
				type: "project_member_removed",
				recipientId: other.id,
				actorId: owner.id,
				projectId: project.id,
				metadata: { projectName: project.name },
			},
		]);

		expect(await markAllNotificationsReadForUser(recipient.id)).toHaveLength(1);
		expect(
			(await getNotificationCenterDataForUser(recipient.id)).unreadCount,
		).toBe(0);
		expect((await getNotificationCenterDataForUser(other.id)).unreadCount).toBe(
			1,
		);
	});
});
