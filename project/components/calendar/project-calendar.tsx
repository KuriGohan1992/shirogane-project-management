"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { CalendarProjectSidebar } from "@/components/calendar/calendar-project-sidebar";
import { ProjectTimelineBar } from "@/components/calendar/project-timeline-bar";
import { CreateProjectButton } from "@/components/create-project-button";
import { ProjectFilterControls } from "@/components/project-filter-controls";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useProjectFilters } from "@/hooks/use-project-filters";
import { DAY_MS, parseDateKey, toDateKey } from "@/lib/calendar-dates";
import { cn } from "@/lib/utils";
import type { CalendarProjectSummary } from "@/types/calendar";

const DAYS_PER_WEEK = 7;

const CALENDAR_WEEK_COUNT = 6;

const CALENDAR_VIEW_PARAM = "view";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type CalendarViewMode = "timeline" | "due";

type TimelineSegment = {
	project: CalendarProjectSummary;
	startColumn: number;
	endColumn: number;
	lane: number;
	continuesBefore: boolean;
	continuesAfter: boolean;
	pointKind: "start" | "due" | null;
};

function startOfMonth(date: Date) {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, amount: number) {
	return new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1),
	);
}

function addDays(date: Date, amount: number) {
	return new Date(date.getTime() + amount * DAY_MS);
}

function differenceInDays(startDateKey: string, endDateKey: string) {
	return Math.round(
		(parseDateKey(endDateKey).getTime() -
			parseDateKey(startDateKey).getTime()) /
			DAY_MS,
	);
}

function formatMonth(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function getCalendarDays(month: Date) {
	const firstDay = startOfMonth(month);

	const gridStart = addDays(firstDay, -firstDay.getUTCDay());

	return Array.from(
		{
			length: DAYS_PER_WEEK * CALENDAR_WEEK_COUNT,
		},
		(_, index) => addDays(gridStart, index),
	);
}

function parseCalendarViewMode(value: string | null): CalendarViewMode {
	return value === "due" ? "due" : "timeline";
}

function replaceCalendarUrl(params: URLSearchParams) {
	const queryString = params.toString();

	const nextUrl = `${window.location.pathname}${
		queryString ? `?${queryString}` : ""
	}${window.location.hash}`;

	window.history.replaceState(null, "", nextUrl);
}

function getTimelineProjectRange(project: CalendarProjectSummary) {
	const firstDate = project.startDate ?? project.dueDate;

	const secondDate = project.dueDate ?? project.startDate;

	if (!firstDate || !secondDate) {
		return null;
	}

	return firstDate <= secondDate
		? {
				start: firstDate,
				end: secondDate,
			}
		: {
				start: secondDate,
				end: firstDate,
			};
}

function getTimelinePointKind(project: CalendarProjectSummary) {
	if (project.startDate && !project.dueDate) {
		return "start" as const;
	}

	if (!project.startDate && project.dueDate) {
		return "due" as const;
	}

	return null;
}

function getProjectCalendarRange(
	project: CalendarProjectSummary,
	viewMode: CalendarViewMode,
) {
	if (viewMode === "due") {
		if (!project.dueDate) {
			return null;
		}

		return {
			start: project.dueDate,
			end: project.dueDate,
			pointKind: "due" as const,
		};
	}

	const range = getTimelineProjectRange(project);

	if (!range) {
		return null;
	}

	return {
		...range,
		pointKind: getTimelinePointKind(project),
	};
}

function buildWeekSegments(
	projects: CalendarProjectSummary[],
	week: Date[],
	viewMode: CalendarViewMode,
): TimelineSegment[] {
	const weekStartKey = toDateKey(week[0] ?? new Date(0));

	const weekEndKey = toDateKey(week[week.length - 1] ?? new Date(0));

	const segments = projects
		.flatMap((project) => {
			const range = getProjectCalendarRange(project, viewMode);

			if (!range || range.end < weekStartKey || range.start > weekEndKey) {
				return [];
			}

			const segmentStart =
				range.start < weekStartKey ? weekStartKey : range.start;

			const segmentEnd = range.end > weekEndKey ? weekEndKey : range.end;

			return [
				{
					project,

					startColumn: differenceInDays(weekStartKey, segmentStart),

					endColumn: differenceInDays(weekStartKey, segmentEnd),

					lane: 0,

					continuesBefore: range.start < segmentStart,

					continuesAfter: range.end > segmentEnd,

					pointKind: range.pointKind,
				},
			];
		})
		.toSorted((left, right) => {
			if (left.startColumn !== right.startColumn) {
				return left.startColumn - right.startColumn;
			}

			const leftSpan = left.endColumn - left.startColumn;

			const rightSpan = right.endColumn - right.startColumn;

			if (leftSpan !== rightSpan) {
				return rightSpan - leftSpan;
			}

			return left.project.name.localeCompare(right.project.name);
		});

	const laneEnds: number[] = [];

	for (const segment of segments) {
		const reusableLane = laneEnds.findIndex(
			(endColumn) => segment.startColumn > endColumn,
		);

		if (reusableLane === -1) {
			segment.lane = laneEnds.length;

			laneEnds.push(segment.endColumn);
		} else {
			segment.lane = reusableLane;

			laneEnds[reusableLane] = segment.endColumn;
		}
	}

	return segments;
}

type ProjectCalendarProps = {
	projects: CalendarProjectSummary[];
	todayDateKey: string;
};

export function ProjectCalendar({
	projects,
	todayDateKey,
}: ProjectCalendarProps) {
	const searchParams = useSearchParams();

	const filters = useProjectFilters(projects, {
		defaultStatus: "active",
	});

	const viewMode = parseCalendarViewMode(searchParams.get(CALENDAR_VIEW_PARAM));

	const [visibleMonth, setVisibleMonth] = useState(() =>
		startOfMonth(parseDateKey(todayDateKey)),
	);

	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
		null,
	);

	const calendarDays = useMemo(
		() => getCalendarDays(visibleMonth),
		[visibleMonth],
	);

	const weeks = useMemo(
		() =>
			Array.from(
				{
					length: CALENDAR_WEEK_COUNT,
				},
				(_, weekIndex) =>
					calendarDays.slice(
						weekIndex * DAYS_PER_WEEK,

						weekIndex * DAYS_PER_WEEK + DAYS_PER_WEEK,
					),
			),
		[calendarDays],
	);

	const calendarProjects = useMemo(
		() =>
			filters.filteredProjects.filter((project) =>
				viewMode === "due"
					? Boolean(project.dueDate)
					: Boolean(project.startDate || project.dueDate),
			),
		[filters.filteredProjects, viewMode],
	);

	const selectedProject =
		projects.find((project) => project.id === selectedProjectId) ?? null;

	function goToToday() {
		setVisibleMonth(startOfMonth(parseDateKey(todayDateKey)));
	}

	function setViewMode(nextViewMode: CalendarViewMode) {
		const params = new URLSearchParams(window.location.search);

		if (nextViewMode === "timeline") {
			params.delete(CALENDAR_VIEW_PARAM);
		} else {
			params.set(CALENDAR_VIEW_PARAM, nextViewMode);
		}

		replaceCalendarUrl(params);
	}

	const calendarUtilityControls = (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="shrink-0 bg-card"
				onClick={goToToday}
			>
				Go to Today
			</Button>
			<Select
				value={searchParams.get(CALENDAR_VIEW_PARAM) ? viewMode : ""}
				onValueChange={(value) => setViewMode(parseCalendarViewMode(value))}
			>
				<SelectTrigger
					size="sm"
					aria-label="Calendar view"
					className="w-fit min-w-24 max-w-40 bg-card data-[placeholder]:text-foreground [&>span:first-child]:truncate"
				>
					<SelectValue placeholder="View" />
				</SelectTrigger>

				<SelectContent position="popper" align="end" sideOffset={4}>
					<SelectItem value="timeline">Timeline</SelectItem>

					<SelectItem value="due">Due date</SelectItem>
				</SelectContent>
			</Select>
		</>
	);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Calendar</h1>

					<p className="mt-0.5 text-muted-foreground">
						{calendarProjects.length === 1
							? "1 scheduled project"
							: `${calendarProjects.length} scheduled projects`}
					</p>
				</div>

				<CreateProjectButton keyboardShortcutTarget />
			</div>

			<ProjectFilterControls
				query={filters.queryInput}
				onQueryChange={filters.setQueryInput}
				accessFilter={filters.accessFilter}
				onAccessFilterChange={filters.setAccessFilter}
				statusFilter={filters.statusFilter}
				defaultStatus={filters.defaultStatus}
				onStatusFilterChange={filters.setStatusFilter}
				colorFilter={filters.colorFilter}
				onColorFilterChange={filters.setColorFilter}
				scheduleFilter={filters.scheduleFilter}
				onScheduleFilterChange={filters.setScheduleFilter}
				hasFilters={filters.hasFilters}
				onClearFilters={filters.clearFilters}
				showScheduleFilter={false}
				utilityControls={calendarUtilityControls}
				compactSearch
			/>

			<section className="overflow-hidden rounded-xl border border-border bg-card">
				{/* Calendar-only navigation */}
				<div className="flex items-center justify-center border-b border-primary bg-primary px-4 py-3 text-primary-foreground">
					<div className="flex items-center">
						<Button
							type="button"
							variant="ghost"
							size="icon-lg"
							aria-label="Previous month"
							className="group bg-transparent text-primary-foreground shadow-none transition-transform hover:scale-110 hover:bg-transparent hover:text-primary-foreground active:scale-95"
							onClick={() =>
								setVisibleMonth((current) => addMonths(current, -1))
							}
						>
							<ChevronLeft
								aria-hidden="true"
								className="size-5 group-hover:[stroke-width:3]"
							/>
						</Button>

						<h2 className="px-2 text-lg font-bold">
							{formatMonth(visibleMonth)}
						</h2>

						<Button
							type="button"
							variant="ghost"
							size="icon-lg"
							aria-label="Next month"
							className="group bg-transparent text-primary-foreground shadow-none transition-transform hover:scale-110 hover:bg-transparent hover:text-primary-foreground active:scale-95"
							onClick={() =>
								setVisibleMonth((current) => addMonths(current, 1))
							}
						>
							<ChevronRight
								aria-hidden="true"
								className="size-5 group-hover:[stroke-width:3]"
							/>
						</Button>
					</div>
				</div>

				<div className="overflow-x-auto">
					<div className="min-w-[900px]">
						<div className="grid grid-cols-7 border-b border-border bg-muted/35">
							{WEEKDAYS.map((weekday) => (
								<div
									key={weekday}
									className="border-r border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0"
								>
									{weekday}
								</div>
							))}
						</div>

						{weeks.map((week) => {
							const weekKey = toDateKey(week[0] ?? new Date(0));

							const segments = buildWeekSegments(
								calendarProjects,
								week,
								viewMode,
							);

							const laneCount = Math.max(
								1,

								segments.reduce(
									(maxLane, segment) =>
										Math.max(
											maxLane,

											segment.lane + 1,
										),

									0,
								),
							);

							return (
								<div
									key={weekKey}
									className="relative border-b border-border last:border-b-0"
								>
									<div
										aria-hidden="true"
										className="pointer-events-none absolute inset-0 grid grid-cols-7"
									>
										{week.map((date) => (
											<div
												key={toDateKey(date)}
												className="border-r border-border last:border-r-0"
											/>
										))}
									</div>

									<div
										className="relative grid grid-cols-7 gap-y-1 px-1 py-1.5"
										style={{
											gridTemplateRows: `2rem repeat(${laneCount}, 2rem)`,
										}}
									>
										{week.map((date, dayIndex) => {
											const dateKey = toDateKey(date);

											const isCurrentMonth =
												date.getUTCMonth() === visibleMonth.getUTCMonth();

											const isToday = dateKey === todayDateKey;

											return (
												<div
													key={dateKey}
													className="flex items-center px-2"
													style={{
														gridColumn: dayIndex + 1,

														gridRow: 1,
													}}
												>
													<span
														className={cn(
															"inline-flex size-7 items-center justify-center rounded-md text-sm font-semibold",

															!isCurrentMonth && "text-muted-foreground/55",

															isCurrentMonth && !isToday && "text-foreground",

															isToday && "bg-primary text-primary-foreground",
														)}
													>
														{date.getUTCDate()}
													</span>
												</div>
											);
										})}

										{segments.map((segment) => (
											<div
												key={`${segment.project.id}:${segment.startColumn}:${segment.endColumn}`}
												className="min-w-0 px-0.5"
												style={{
													gridColumn: `${segment.startColumn + 1} / ${segment.endColumn + 2}`,

													gridRow: segment.lane + 2,
												}}
											>
												<ProjectTimelineBar
													project={segment.project}
													continuesBefore={segment.continuesBefore}
													continuesAfter={segment.continuesAfter}
													pointKind={segment.pointKind}
													onSelect={setSelectedProjectId}
												/>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<CalendarProjectSidebar
				project={selectedProject}
				onOpenChange={(open) => {
					if (!open) {
						setSelectedProjectId(null);
					}
				}}
			/>
		</div>
	);
}
