import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createNotificationRecords: vi.fn(),
	getNotificationPreferencesForUsers: vi.fn(),
}));

vi.mock("@/lib/db/notifications", () => ({
	createNotificationRecords: mocks.createNotificationRecords,
}));

vi.mock("@/lib/db/users", () => ({
	getNotificationPreferencesForUsers: mocks.getNotificationPreferencesForUsers,
}));

import { createNotificationsSafely } from "@/lib/services/notifications";

describe("createNotificationsSafely", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getNotificationPreferencesForUsers.mockResolvedValue(new Map());
		mocks.createNotificationRecords.mockImplementation(
			async (inputs) => inputs,
		);
	});

	it("drops self-notifications before reading preferences", async () => {
		const result = await createNotificationsSafely([
			{
				type: "task_assigned",
				recipientId: "user-1",
				actorId: "user-1",
				projectId: "project-1",
				taskId: "task-1",
				metadata: {
					projectName: "Shiro",
					taskTitle: "Ship MVP",
				},
			},
		]);

		expect(result).toEqual([]);
		expect(mocks.getNotificationPreferencesForUsers).not.toHaveBeenCalled();
		expect(mocks.createNotificationRecords).not.toHaveBeenCalled();
	});

	it("filters notifications using recipient preferences", async () => {
		mocks.getNotificationPreferencesForUsers.mockResolvedValue(
			new Map([
				[
					"muted",
					{
						notificationsMuted: false,
						mutedCategories: ["comments"],
					},
				],
			]),
		);

		await createNotificationsSafely([
			{
				type: "task_comment_added",
				recipientId: "muted",
				actorId: "actor",
				projectId: "project",
				taskId: "task",
				metadata: { projectName: "Shiro", taskTitle: "Commented task" },
			},
			{
				type: "task_assigned",
				recipientId: "allowed",
				actorId: "actor",
				projectId: "project",
				taskId: "task",
				metadata: { projectName: "Shiro", taskTitle: "Assigned task" },
			},
		]);

		expect(mocks.createNotificationRecords).toHaveBeenCalledOnce();
		expect(mocks.createNotificationRecords).toHaveBeenCalledWith([
			expect.objectContaining({
				type: "task_assigned",
				recipientId: "allowed",
			}),
		]);
	});

	it("fails closed when notification persistence throws", async () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		mocks.getNotificationPreferencesForUsers.mockRejectedValue(
			new Error("database unavailable"),
		);

		await expect(
			createNotificationsSafely([
				{
					type: "project_member_removed",
					recipientId: "recipient",
					actorId: "actor",
					projectId: "project",
					metadata: { projectName: "Shiro" },
				},
			]),
		).resolves.toEqual([]);

		expect(consoleError).toHaveBeenCalledOnce();
		consoleError.mockRestore();
	});
});
