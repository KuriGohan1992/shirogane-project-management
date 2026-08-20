import { SEARCH_LIMITS } from "@/lib/constants/search";
import type { Task } from "@/lib/db/schema";
import type { TaskWithBoardDetails } from "@/types/task";

export const TASK_FILTER_PARAMS = {
	query: "q",
	priority: "priority",
	label: "label",
	assignee: "assignee",
	due: "due",
} as const;

export const TASK_PRIORITY_FILTER_OPTIONS = [
	{
		value: "low",
		label: "Low",
	},
	{
		value: "medium",
		label: "Medium",
	},
	{
		value: "high",
		label: "High",
	},
	{
		value: "urgent",
		label: "Urgent",
	},
] as const satisfies ReadonlyArray<{
	value: Task["priority"];
	label: string;
}>;

export const TASK_DUE_FILTER_OPTIONS = [
	{
		value: "no-due-date",
		label: "No due date",
	},
	{
		value: "overdue",
		label: "Overdue",
	},
	{
		value: "due-today",
		label: "Due today",
	},
	{
		value: "due-next-7-days",
		label: "Due in next 7 days",
	},
	{
		value: "due-next-30-days",
		label: "Due in next 30 days",
	},
] as const;

export const UNASSIGNED_TASK_FILTER_VALUE = "unassigned";

export type TaskDueFilter = (typeof TASK_DUE_FILTER_OPTIONS)[number]["value"];

export type TaskFilters = {
	query: string;
	priorities: Task["priority"][];
	labelIds: string[];
	assigneeIds: string[];
	dueDates: TaskDueFilter[];
};

type SearchParamsReader = {
	get: (name: string) => string | null;
	getAll: (name: string) => string[];
};

const TASK_PRIORITY_FILTER_VALUES = TASK_PRIORITY_FILTER_OPTIONS.map(
	(option) => option.value,
);

const TASK_DUE_FILTER_VALUES = TASK_DUE_FILTER_OPTIONS.map(
	(option) => option.value,
);

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function isTaskPriority(value: string): value is Task["priority"] {
	return TASK_PRIORITY_FILTER_VALUES.some((priority) => priority === value);
}

function isTaskDueFilter(value: string): value is TaskDueFilter {
	return TASK_DUE_FILTER_VALUES.some((filter) => filter === value);
}

function getUniqueValues(values: string[]) {
	return [...new Set(values)];
}

function getUtcDayValue(date: Date) {
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getLocalTodayValue() {
	const now = new Date();

	return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

function matchesDueDateFilter(
	task: TaskWithBoardDetails,
	filter: TaskDueFilter,
	today: number,
) {
	if (filter === "no-due-date") {
		return !task.dueDate;
	}

	if (!task.dueDate) {
		return false;
	}

	const dueDate = getUtcDayValue(task.dueDate);

	switch (filter) {
		case "overdue":
			return dueDate < today;

		case "due-today":
			return dueDate === today;

		case "due-next-7-days":
			return dueDate > today && dueDate <= today + 7 * DAY_IN_MS;

		case "due-next-30-days":
			return dueDate > today && dueDate <= today + 30 * DAY_IN_MS;
	}
}

export function parseTaskFilters(
	searchParams: SearchParamsReader,
	allowedLabelIds: string[],
	allowedAssigneeIds: string[],
): TaskFilters {
	const allowedLabelIdSet = new Set(allowedLabelIds);

	const allowedAssigneeIdSet = new Set(allowedAssigneeIds);

	const priorities = getUniqueValues(
		searchParams.getAll(TASK_FILTER_PARAMS.priority),
	).filter(isTaskPriority);

	const labelIds = getUniqueValues(
		searchParams.getAll(TASK_FILTER_PARAMS.label),
	).filter((labelId) => allowedLabelIdSet.has(labelId));

	const assigneeIds = getUniqueValues(
		searchParams.getAll(TASK_FILTER_PARAMS.assignee),
	).filter(
		(assigneeId) =>
			assigneeId === UNASSIGNED_TASK_FILTER_VALUE ||
			allowedAssigneeIdSet.has(assigneeId),
	);

	const dueDates = getUniqueValues(
		searchParams.getAll(TASK_FILTER_PARAMS.due),
	).filter(isTaskDueFilter);

	return {
		query:
			searchParams
				.get(TASK_FILTER_PARAMS.query)
				?.slice(0, SEARCH_LIMITS.maxQueryLength) ?? "",

		priorities,
		labelIds,
		assigneeIds,
		dueDates,
	};
}

export function hasTaskFilters(filters: TaskFilters) {
	return (
		filters.query.trim().length > 0 ||
		filters.priorities.length > 0 ||
		filters.labelIds.length > 0 ||
		filters.assigneeIds.length > 0 ||
		filters.dueDates.length > 0
	);
}

export function getActiveTaskFilterCount(filters: TaskFilters) {
	return (
		(filters.query.trim().length > 0 ? 1 : 0) +
		filters.priorities.length +
		filters.labelIds.length +
		filters.assigneeIds.length +
		filters.dueDates.length
	);
}

export function matchesTaskFilters(
	task: TaskWithBoardDetails,
	filters: TaskFilters,
	today = getLocalTodayValue(),
) {
	const normalizedQuery = filters.query.trim().toLocaleLowerCase("en-US");

	const matchesQuery =
		normalizedQuery.length === 0 ||
		task.title.toLocaleLowerCase("en-US").includes(normalizedQuery) ||
		(task.description?.toLocaleLowerCase("en-US").includes(normalizedQuery) ??
			false);

	const matchesPriority =
		filters.priorities.length === 0 ||
		filters.priorities.includes(task.priority);

	const matchesLabel =
		filters.labelIds.length === 0 ||
		task.labels.some((taskLabel) =>
			filters.labelIds.includes(taskLabel.label.id),
		);

	const wantsUnassigned = filters.assigneeIds.includes(
		UNASSIGNED_TASK_FILTER_VALUE,
	);

	const selectedAssigneeIds = filters.assigneeIds.filter(
		(assigneeId) => assigneeId !== UNASSIGNED_TASK_FILTER_VALUE,
	);

	const matchesAssignee =
		filters.assigneeIds.length === 0 ||
		(wantsUnassigned && task.assignees.length === 0) ||
		task.assignees.some((assignee) =>
			selectedAssigneeIds.includes(assignee.user.id),
		);

	const matchesDueDate =
		filters.dueDates.length === 0 ||
		filters.dueDates.some((filter) =>
			matchesDueDateFilter(task, filter, today),
		);

	return (
		matchesQuery &&
		matchesPriority &&
		matchesLabel &&
		matchesAssignee &&
		matchesDueDate
	);
}
