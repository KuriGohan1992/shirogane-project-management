import type { CalendarProjectSummary } from "@/types/calendar";

export const DAY_MS = 86_400_000;

export function parseDateKey(dateKey: string) {
	const [year, month, day] = dateKey.split("-").map(Number);

	return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
}

export function toDateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

export function formatDateKey(
	dateKey: string,
	options: {
		includeYear?: boolean;
	} = {},
) {
	const { includeYear = true } = options;

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: includeYear ? "numeric" : undefined,
		timeZone: "UTC",
	}).format(parseDateKey(dateKey));
}

export function formatActivityDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(value));
}

export function formatCalendarProjectSchedule(
	project: Pick<CalendarProjectSummary, "startDate" | "dueDate">,
) {
	if (project.startDate && project.dueDate) {
		return `${formatDateKey(project.startDate)} – ${formatDateKey(project.dueDate)}`;
	}

	if (project.startDate) {
		return `Starts ${formatDateKey(project.startDate)}`;
	}

	if (project.dueDate) {
		return `Due ${formatDateKey(project.dueDate)}`;
	}

	return "No project dates";
}
