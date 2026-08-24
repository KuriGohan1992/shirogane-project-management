import { describe, expect, it } from "vitest";

import {
	getActiveTaskFilterCount,
	hasTaskFilters,
	matchesTaskFilters,
	NO_PRIORITY_TASK_FILTER_VALUE,
	parseTaskFilters,
	type TaskFilters,
	UNASSIGNED_TASK_FILTER_VALUE,
} from "@/lib/task-filters";
import type { TaskWithBoardDetails } from "@/types/task";

function makeTask(
	overrides: Partial<TaskWithBoardDetails> = {},
): TaskWithBoardDetails {
	return {
		id: "task",
		stageId: "stage",
		title: "Build dashboard",
		description: "Finish the dashboard metrics",
		position: 0,
		priority: "high",
		startDate: null,
		dueDate: null,
		completedAt: null,
		archivedAt: null,
		createdAt: new Date("2026-08-01T00:00:00.000Z"),
		updatedAt: new Date("2026-08-01T00:00:00.000Z"),
		assignees: [],
		labels: [],
		comments: [],
		...overrides,
	} as TaskWithBoardDetails;
}

function filters(overrides: Partial<TaskFilters> = {}): TaskFilters {
	return {
		query: "",
		priorities: [],
		labelIds: [],
		assigneeIds: [],
		dueDates: [],
		completion: null,
		...overrides,
	};
}

describe("parseTaskFilters", () => {
	it("deduplicates filters and removes values outside the allowed sets", () => {
		const params = new URLSearchParams();

		params.append("priority", "high");
		params.append("priority", "high");
		params.append("priority", "invalid");
		params.append("label", "label-1");
		params.append("label", "forbidden-label");
		params.append("assignee", "user-1");
		params.append("assignee", UNASSIGNED_TASK_FILTER_VALUE);
		params.append("assignee", "forbidden-user");
		params.append("due", "overdue");
		params.append("due", "invalid");
		params.set("completion", "completed");

		expect(parseTaskFilters(params, ["label-1"], ["user-1"])).toEqual({
			query: "",
			priorities: ["high"],
			labelIds: ["label-1"],
			assigneeIds: ["user-1", UNASSIGNED_TASK_FILTER_VALUE],
			dueDates: ["overdue"],
			completion: "completed",
		});
	});

	it("truncates very long search queries", () => {
		const params = new URLSearchParams({
			q: "x".repeat(150),
		});

		expect(parseTaskFilters(params, [], []).query).toHaveLength(100);
	});
});

describe("task filter state", () => {
	it("detects whether filters are active", () => {
		expect(hasTaskFilters(filters())).toBe(false);
		expect(hasTaskFilters(filters({ query: "  dashboard " }))).toBe(true);
		expect(hasTaskFilters(filters({ priorities: ["urgent"] }))).toBe(true);
	});

	it("counts each selected filter value", () => {
		expect(
			getActiveTaskFilterCount(
				filters({
					query: "task",
					priorities: ["high", "urgent"],
					labelIds: ["label-1"],
					assigneeIds: ["user-1"],
					dueDates: ["overdue", "due-today"],
					completion: "open",
				}),
			),
		).toBe(8);
	});
});

describe("matchesTaskFilters", () => {
	const today = Date.UTC(2026, 7, 25);

	it("matches query text against title and description without case sensitivity", () => {
		expect(
			matchesTaskFilters(
				makeTask({ title: "Launch Shiro" }),
				filters({ query: "shiro" }),
				today,
			),
		).toBe(true);

		expect(
			matchesTaskFilters(
				makeTask({ description: "Prepare stakeholder DEMO" }),
				filters({ query: "demo" }),
				today,
			),
		).toBe(true);
	});

	it("supports priority and no-priority filters", () => {
		expect(
			matchesTaskFilters(
				makeTask({ priority: "urgent" }),
				filters({ priorities: ["urgent"] }),
				today,
			),
		).toBe(true);

		expect(
			matchesTaskFilters(
				makeTask({ priority: null }),
				filters({ priorities: [NO_PRIORITY_TASK_FILTER_VALUE] }),
				today,
			),
		).toBe(true);
	});

	it("matches selected labels", () => {
		const task = makeTask({
			labels: [
				{
					taskId: "task",
					labelId: "label-1",
					label: { id: "label-1" },
				},
			] as TaskWithBoardDetails["labels"],
		});

		expect(
			matchesTaskFilters(task, filters({ labelIds: ["label-1"] }), today),
		).toBe(true);
		expect(
			matchesTaskFilters(task, filters({ labelIds: ["label-2"] }), today),
		).toBe(false);
	});

	it("matches assigned and unassigned tasks", () => {
		const assigned = makeTask({
			assignees: [
				{
					taskId: "task",
					userId: "user-1",
					assignedAt: new Date(),
					user: { id: "user-1" },
				},
			] as TaskWithBoardDetails["assignees"],
		});

		expect(
			matchesTaskFilters(assigned, filters({ assigneeIds: ["user-1"] }), today),
		).toBe(true);

		expect(
			matchesTaskFilters(
				makeTask(),
				filters({ assigneeIds: [UNASSIGNED_TASK_FILTER_VALUE] }),
				today,
			),
		).toBe(true);
	});

	it("handles overdue, today, and upcoming due-date windows", () => {
		expect(
			matchesTaskFilters(
				makeTask({ dueDate: new Date("2026-08-24T00:00:00.000Z") }),
				filters({ dueDates: ["overdue"] }),
				today,
			),
		).toBe(true);

		expect(
			matchesTaskFilters(
				makeTask({ dueDate: new Date("2026-08-25T00:00:00.000Z") }),
				filters({ dueDates: ["due-today"] }),
				today,
			),
		).toBe(true);

		expect(
			matchesTaskFilters(
				makeTask({ dueDate: new Date("2026-09-01T00:00:00.000Z") }),
				filters({ dueDates: ["due-next-7-days"] }),
				today,
			),
		).toBe(true);

		expect(
			matchesTaskFilters(
				makeTask({ dueDate: new Date("2026-09-24T00:00:00.000Z") }),
				filters({ dueDates: ["due-next-30-days"] }),
				today,
			),
		).toBe(true);
	});

	it("does not treat completed past-due tasks as overdue", () => {
		expect(
			matchesTaskFilters(
				makeTask({
					dueDate: new Date("2026-08-20T00:00:00.000Z"),
					completedAt: new Date("2026-08-21T00:00:00.000Z"),
				}),
				filters({ dueDates: ["overdue"] }),
				today,
			),
		).toBe(false);
	});

	it("filters open and completed tasks", () => {
		expect(
			matchesTaskFilters(makeTask(), filters({ completion: "open" }), today),
		).toBe(true);

		expect(
			matchesTaskFilters(
				makeTask({ completedAt: new Date() }),
				filters({ completion: "completed" }),
				today,
			),
		).toBe(true);
	});
});
