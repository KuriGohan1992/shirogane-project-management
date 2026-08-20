import { COLOR_VALUES, type ColorValue } from "@/lib/constants/colors";
import type { ProjectWithAccess } from "@/types/project";

export const PROJECT_FILTER_PARAMS = {
	query: "q",
	access: "access",
	color: "color",
	dates: "dates",
	sort: "sort",
} as const;

export const PROJECT_FILTER_DEFAULTS = {
	access: "all",
	color: "all",
	dates: "all",
	sort: "last-activity",
} as const;

const ACCESS_FILTER_VALUES = ["owner", "member", "viewer"] as const;

const SCHEDULE_FILTER_VALUES = [
	"no-dates",
	"overdue",
	"due-next-7-days",
] as const;

const SORT_VALUES = [
	"last-activity",
	"created-newest",
	"created-oldest",
	"due-date",
	"name",
] as const;

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

export function matchesProjectScheduleFilter(
	project: ProjectWithAccess,
	filter: ProjectScheduleFilter,
	today = getUtcDayValue(new Date()),
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

export function sortProjects(
	projects: ProjectWithAccess[],
	sort: ProjectSortOption,
) {
	return [...projects].sort((left, right) => {
		switch (sort) {
			case "created-newest": {
				const difference = right.createdAt.getTime() - left.createdAt.getTime();

				return difference || compareProjectNames(left, right);
			}

			case "created-oldest": {
				const difference = left.createdAt.getTime() - right.createdAt.getTime();

				return difference || compareProjectNames(left, right);
			}

			case "due-date": {
				if (!left.dueDate && !right.dueDate) {
					return compareProjectNames(left, right);
				}

				if (!left.dueDate) {
					return 1;
				}

				if (!right.dueDate) {
					return -1;
				}

				const difference = left.dueDate.getTime() - right.dueDate.getTime();

				return difference || compareProjectNames(left, right);
			}

			case "name":
				return compareProjectNames(left, right);

			case "last-activity": {
				const difference =
					right.lastActivityAt.getTime() - left.lastActivityAt.getTime();

				return difference || compareProjectNames(left, right);
			}
		}

		return 0;
	});
}
