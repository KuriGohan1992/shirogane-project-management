import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createNotificationsSafely: vi.fn(),
	getTaskAssignmentsDueBetween: vi.fn(),
}));

vi.mock("@/lib/db/notifications", () => ({
	getTaskAssignmentsDueBetween: mocks.getTaskAssignmentsDueBetween,
}));

vi.mock("@/lib/services/notifications", () => ({
	createNotificationsSafely: mocks.createNotificationsSafely,
}));

import { GET } from "@/app/api/cron/task-due-reminders/route";

describe("task due reminder cron route", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T18:30:00.000Z"));
		process.env.CRON_SECRET = "test-cron-secret";
		mocks.getTaskAssignmentsDueBetween.mockResolvedValue([]);
		mocks.createNotificationsSafely.mockResolvedValue([]);
	});

	afterEach(() => {
		vi.useRealTimers();
		delete process.env.CRON_SECRET;
		vi.clearAllMocks();
	});

	it("rejects requests without the configured bearer secret", async () => {
		const response = await GET(
			new Request("http://localhost/api/cron/task-due-reminders"),
		);

		expect(response.status).toBe(401);
		expect(await response.text()).toBe("Unauthorized");
		expect(mocks.getTaskAssignmentsDueBetween).not.toHaveBeenCalled();
	});

	it("queries the current UTC day and creates deduplicated reminders", async () => {
		mocks.getTaskAssignmentsDueBetween.mockResolvedValue([
			{
				recipientId: "recipient",
				taskId: "task-1",
				taskTitle: "Ship MVP",
				dueDate: new Date("2026-08-25T00:00:00.000Z"),
				projectId: "project-1",
				projectName: "Shiro",
			},
		]);
		mocks.createNotificationsSafely.mockResolvedValue([{ id: "notification" }]);

		const response = await GET(
			new Request("http://localhost/api/cron/task-due-reminders", {
				headers: {
					authorization: "Bearer test-cron-secret",
				},
			}),
		);

		expect(mocks.getTaskAssignmentsDueBetween).toHaveBeenCalledWith(
			new Date("2026-08-25T00:00:00.000Z"),
			new Date("2026-08-26T00:00:00.000Z"),
		);
		expect(mocks.createNotificationsSafely).toHaveBeenCalledWith([
			{
				type: "task_due_soon",
				recipientId: "recipient",
				projectId: "project-1",
				taskId: "task-1",
				dedupeKey: "task-due-soon:task-1:2026-08-25T00:00:00.000Z",
				metadata: {
					projectName: "Shiro",
					taskTitle: "Ship MVP",
					dueDate: "2026-08-25T00:00:00.000Z",
				},
			},
		]);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ checked: 1, created: 1 });
	});
});
