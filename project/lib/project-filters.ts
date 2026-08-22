import {
	COLOR_OPTIONS,
	COLOR_VALUES,
	type ColorValue,
} from "@/lib/constants/colors";
import type { ProjectWithAccess } from "@/types/project";

export const PROJECT_FILTER_PARAMS = {
	query: "q",
	access: "access",
	color: "color",
	status: "status",
	dates: "dates",
	sort: "sort",
	order: "order",
} as const;

export const PROJECT_FILTER_DEFAULTS = {
	access: "all",
	color: "all",
	status: "all",
	dates: "all",
	sort: "last-activity",
} as const;

const ACCESS_FILTER_VALUES = ["owner", "member", "viewer"] as const;
const STATUS_FILTER_VALUES = ["open", "closed"] as const;

const SCHEDULE_FILTER_VALUES = [
	"no-dates",
	"overdue",
	"due-next-7-days",
] as const;

const SORT_VALUES = [
	"last-activity",
	"date-created",
	"due-date",
	"name",
	"color",
] as const;

const SORT_DIRECTION_VALUES = ["asc", "desc"] as const;

export type ProjectAccessFilter =
	| typeof PROJECT_FILTER_DEFAULTS.access
	| (typeof ACCESS_FILTER_VALUES)[number];

export type ProjectColorFilter =
	| typeof PROJECT_FILTER_DEFAULTS.color
	| ColorValue;

export type ProjectScheduleFilter =
	| typeof PROJECT_FILTER_DEFAULTS.dates
	| (typeof SCHEDULE_FILTER_VALUES)[number];

export type ProjectSortOption = (typeof SORT_VALUES)[number];

export type ProjectSortDirection = (typeof SORT_DIRECTION_VALUES)[number];
export type ProjectStatusFilter =
	| typeof PROJECT_FILTER_DEFAULTS.status
	| (typeof STATUS_FILTER_VALUES)[number];

const PROJECT_SORT_DEFAULT_DIRECTION: Record<
	ProjectSortOption,
	ProjectSortDirection
> = {
	"last-activity": "desc",
	"date-created": "desc",
	"due-date": "asc",
	name: "asc",
	color: "asc",
};

const COLOR_SORT_ORDER = new Map<ColorValue, number>(
	COLOR_OPTIONS.map((option, index) => [option.value, index]),
);

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function includesValue<const T extends readonly string[]>(
	values: T,
	value: string | null,
): value is T[number] {
	return value !== null && values.some((option) => option === value);
}

function compareProjectNames(
	left: ProjectWithAccess,
	right: ProjectWithAccess,
) {
	return left.name.localeCompare(right.name, undefined, {
		sensitivity: "base",
	});
}

function getUtcDayValue(date: Date) {
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}
function getLocalTodayValue() {
	const now = new Date();

	return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getDefaultProjectSortDirection(sort: ProjectSortOption) {
	return PROJECT_SORT_DEFAULT_DIRECTION[sort];
}

export function parseProjectAccessFilter(
	value: string | null,
): ProjectAccessFilter {
	return includesValue(ACCESS_FILTER_VALUES, value)
		? value
		: PROJECT_FILTER_DEFAULTS.access;
}

export function parseProjectColorFilter(
	value: string | null,
): ProjectColorFilter {
	return includesValue(COLOR_VALUES, value)
		? value
		: PROJECT_FILTER_DEFAULTS.color;
}

export function parseProjectStatusFilter(
	value: string | null,
): ProjectStatusFilter {
	return includesValue(STATUS_FILTER_VALUES, value)
		? value
		: PROJECT_FILTER_DEFAULTS.status;
}

export function parseProjectScheduleFilter(
	value: string | null,
): ProjectScheduleFilter {
	return includesValue(SCHEDULE_FILTER_VALUES, value)
		? value
		: PROJECT_FILTER_DEFAULTS.dates;
}

export function parseProjectSortOption(
	value: string | null,
): ProjectSortOption {
	return includesValue(SORT_VALUES, value)
		? value
		: PROJECT_FILTER_DEFAULTS.sort;
}

export function parseProjectSortDirection(
	value: string | null,
	sort: ProjectSortOption,
): ProjectSortDirection {
	return includesValue(SORT_DIRECTION_VALUES, value)
		? value
		: getDefaultProjectSortDirection(sort);
}

export function matchesProjectScheduleFilter(
	project: ProjectWithAccess,
	filter: ProjectScheduleFilter,
	today = getLocalTodayValue(),
) {
	if (filter === "all") {
		return true;
	}

	if (filter === "no-dates") {
		return !project.startDate && !project.dueDate;
	}

	if (!project.dueDate) {
		return false;
	}

	const dueDate = getUtcDayValue(project.dueDate);

	if (filter === "overdue") {
		return dueDate < today;
	}

	return dueDate >= today && dueDate <= today + 7 * DAY_IN_MS;
}

export function matchesProjectStatusFilter(
	project: ProjectWithAccess,
	filter: ProjectStatusFilter,
) {
	if (filter === "all") {
		return true;
	}

	return filter === "closed"
		? project.closedAt !== null
		: project.closedAt === null;
}

export function sortProjects(
	projects: ProjectWithAccess[],
	sort: ProjectSortOption,
	direction: ProjectSortDirection,
) {
	const directionMultiplier = direction === "asc" ? 1 : -1;

	return [...projects].sort((left, right) => {
		switch (sort) {
			case "last-activity": {
				const difference =
					left.lastActivityAt.getTime() - right.lastActivityAt.getTime();

				return (
					(difference || compareProjectNames(left, right)) * directionMultiplier
				);
			}

			case "date-created": {
				const difference = left.createdAt.getTime() - right.createdAt.getTime();

				return (
					(difference || compareProjectNames(left, right)) * directionMultiplier
				);
			}

			case "due-date": {
				// Projects without due dates stay last regardless of direction.
				if (!left.dueDate && !right.dueDate) {
					return compareProjectNames(left, right) * directionMultiplier;
				}

				if (!left.dueDate) {
					return 1;
				}

				if (!right.dueDate) {
					return -1;
				}

				const difference = left.dueDate.getTime() - right.dueDate.getTime();

				return (
					(difference || compareProjectNames(left, right)) * directionMultiplier
				);
			}

			case "name":
				return compareProjectNames(left, right) * directionMultiplier;

			case "color": {
				const leftColor =
					COLOR_SORT_ORDER.get(left.color) ?? Number.MAX_SAFE_INTEGER;

				const rightColor =
					COLOR_SORT_ORDER.get(right.color) ?? Number.MAX_SAFE_INTEGER;

				const difference = leftColor - rightColor;

				return (
					(difference || compareProjectNames(left, right)) * directionMultiplier
				);
			}
		}

		return 0;
	});
}
