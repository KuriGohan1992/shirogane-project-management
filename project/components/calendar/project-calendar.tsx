"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { CalendarProjectSidebar } from "@/components/calendar/calendar-project-sidebar";
import { ProjectTimelineBar } from "@/components/calendar/project-timeline-bar";
import { Button } from "@/components/ui/button";
import { DAY_MS, parseDateKey, toDateKey } from "@/lib/calendar-dates";
import { cn } from "@/lib/utils";
import type { CalendarProjectSummary } from "@/types/calendar";

const DAYS_PER_WEEK = 7;
const CALENDAR_WEEK_COUNT = 6;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

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

function getProjectRange(project: CalendarProjectSummary) {
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

function getPointKind(project: CalendarProjectSummary) {
	if (project.startDate && !project.dueDate) {
		return "start" as const;
	}

	if (!project.startDate && project.dueDate) {
		return "due" as const;
	}

	return null;
}

function buildWeekSegments(
	projects: CalendarProjectSummary[],
	week: Date[],
): TimelineSegment[] {
	const weekStartKey = toDateKey(week[0] ?? new Date(0));

	const weekEndKey = toDateKey(week[week.length - 1] ?? new Date(0));

	const segments = projects
		.flatMap((project) => {
			const range = getProjectRange(project);

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

					pointKind: getPointKind(project),
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
	const [visibleMonth, setVisibleMonth] = useState(() =>
		startOfMonth(parseDateKey(todayDateKey)),
	);

	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
		null,
	);

	const [showCompleted, setShowCompleted] = useState(false);

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

	const scheduledProjects = useMemo(
		() =>
			projects.filter(
				(project) =>
					(project.startDate || project.dueDate) &&
					(showCompleted || !project.completedAt),
			),
		[projects, showCompleted],
	);

	const selectedProject =
		projects.find((project) => project.id === selectedProjectId) ?? null;

	function goToToday() {
		setVisibleMonth(startOfMonth(parseDateKey(todayDateKey)));
	}

	return (
		<>
			<section className="overflow-hidden rounded-xl border border-border bg-card">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary bg-primary px-4 py-3 text-primary-foreground">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="bg-transparent font-medium text-primary-foreground shadow-none transition-transform hover:scale-105 hover:bg-transparent hover:font-semibold hover:text-primary-foreground active:scale-95"
						onClick={goToToday}
					>
						Go to Today
					</Button>

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

						<h2 className="px-1 text-lg font-bold">
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
					<label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-primary-foreground">
						<span>Show completed</span>

						<input
							type="checkbox"
							checked={showCompleted}
							onChange={(event) => setShowCompleted(event.target.checked)}
							className="size-4 cursor-pointer accent-primary-foreground"
						/>
					</label>
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

							const segments = buildWeekSegments(scheduledProjects, week);

							const laneCount = Math.max(
								1,

								segments.reduce(
									(maxLane, segment) => Math.max(maxLane, segment.lane + 1),
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
		</>
	);
}
