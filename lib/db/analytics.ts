import "server-only";

import {
	and,
	count,
	desc,
	eq,
	gte,
	inArray,
	isNotNull,
	isNull,
	lt,
	or,
	sql,
} from "drizzle-orm";

import {
	type AnalyticsBucket,
	type AnalyticsPeriod,
	getAnalyticsPeriodOption,
	getAnalyticsRanges,
} from "@/lib/analytics";
import { db } from "@/lib/db";
import { getProjectsForUser } from "@/lib/db/projects";
import { activityLogs, stages, tasks, users } from "@/lib/db/schema";
import type {
	AnalyticsData,
	AnalyticsMetric,
	AnalyticsPriority,
	AnalyticsTrendPoint,
} from "@/types/analytics";

const DAY_MS = 24 * 60 * 60 * 1000;

function toNullableNumber(value: string | number | null | undefined) {
	if (value === null || value === undefined) {
		return null;
	}

	const number = Number(value);

	return Number.isFinite(number) ? number : null;
}

function getDeltaPercent(
	current: number | null,
	previous: number | null,
): number | null {
	if (current === null || previous === null) {
		return null;
	}

	if (previous === 0) {
		return current === 0 ? 0 : null;
	}

	return ((current - previous) / Math.abs(previous)) * 100;
}

function createMetric(
	current: number | null,
	previous: number | null,
): AnalyticsMetric {
	return {
		current,
		previous,
		deltaPercent: getDeltaPercent(current, previous),
	};
}

function getRate(numerator: number, denominator: number) {
	return denominator === 0 ? null : (numerator / denominator) * 100;
}

function dateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

function startOfUtcWeek(date: Date) {
	const result = new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);

	const day = result.getUTCDay();

	const offset = day === 0 ? -6 : 1 - day;

	result.setUTCDate(result.getUTCDate() + offset);

	return result;
}

function startOfUtcMonth(date: Date) {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function formatTrendLabel(date: Date, bucket: AnalyticsBucket) {
	if (bucket === "month") {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			year: "2-digit",
			timeZone: "UTC",
		}).format(date);
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function buildTrendSeries(
	period: AnalyticsPeriod,
	currentStart: Date,
	currentEnd: Date,
	createdRows: Array<{
		bucket: string;
		count: number;
	}>,
	completedRows: Array<{
		bucket: string;
		count: number;
	}>,
): AnalyticsTrendPoint[] {
	const { bucket } = getAnalyticsPeriodOption(period);

	const createdByBucket = new Map(
		createdRows.map((row) => [row.bucket, row.count]),
	);

	const completedByBucket = new Map(
		completedRows.map((row) => [row.bucket, row.count]),
	);

	const points: AnalyticsTrendPoint[] = [];

	let cursor =
		bucket === "month"
			? startOfUtcMonth(currentStart)
			: bucket === "week"
				? startOfUtcWeek(currentStart)
				: new Date(currentStart);

	while (cursor < currentEnd) {
		const key = dateKey(cursor);

		points.push({
			key,
			label: formatTrendLabel(cursor, bucket),
			created: createdByBucket.get(key) ?? 0,
			completed: completedByBucket.get(key) ?? 0,
		});

		const next = new Date(cursor);

		if (bucket === "month") {
			next.setUTCMonth(next.getUTCMonth() + 1);
		} else if (bucket === "week") {
			next.setUTCDate(next.getUTCDate() + 7);
		} else {
			next.setTime(next.getTime() + DAY_MS);
		}

		cursor = next;
	}

	return points;
}

export async function getAnalyticsForUser(
	userId: string,
	input: {
		period: AnalyticsPeriod;
		projectId?: string;
	},
): Promise<AnalyticsData> {
	const accessibleProjects = await getProjectsForUser(userId);

	const projectOptions = accessibleProjects
		.map((project) => ({
			id: project.id,
			name: project.name,
			color: project.color,
		}))
		.sort((left, right) => left.name.localeCompare(right.name));

	const selectedProject = input.projectId
		? accessibleProjects.find((project) => project.id === input.projectId)
		: undefined;

	const selectedProjectId = selectedProject?.id ?? null;

	const scopedProjects = selectedProject
		? [selectedProject]
		: accessibleProjects;

	const projectIds = scopedProjects.map((project) => project.id);

	const periodOption = getAnalyticsPeriodOption(input.period);

	const ranges = getAnalyticsRanges(input.period);

	const now = new Date();

	const todayStart = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);

	const emptyTrend = buildTrendSeries(
		input.period,
		ranges.currentStart,
		ranges.currentEnd,
		[],
		[],
	);

	if (projectIds.length === 0) {
		return {
			hasProjects: accessibleProjects.length > 0,

			filters: {
				period: input.period,
				periodLabel: periodOption.label,
				selectedProjectId,
			},

			projectOptions,

			overview: {
				completedTasks: createMetric(0, 0),

				avgCompletionDays: createMetric(null, null),

				onTimeRate: {
					...createMetric(null, null),
					sampleSize: 0,
				},

				activeCollaborators: createMetric(0, 0),
			},

			trend: emptyTrend,

			taskHealth: {
				total: 0,
				completed: 0,
				open: 0,
				overdue: 0,
			},

			priorityDistribution: [
				{
					priority: "urgent",
					count: 0,
				},
				{
					priority: "high",
					count: 0,
				},
				{
					priority: "medium",
					count: 0,
				},
				{
					priority: "low",
					count: 0,
				},
				{
					priority: "none",
					count: 0,
				},
			],

			projectProgress: [],

			contributors: [],
		};
	}

	const createdBucket =
		periodOption.bucket === "month"
			? sql`date_trunc('month', timezone('UTC', ${tasks.createdAt}))`
			: periodOption.bucket === "week"
				? sql`date_trunc('week', timezone('UTC', ${tasks.createdAt}))`
				: sql`date_trunc('day', timezone('UTC', ${tasks.createdAt}))`;

	const completedBucket =
		periodOption.bucket === "month"
			? sql`date_trunc('month', timezone('UTC', ${tasks.completedAt}))`
			: periodOption.bucket === "week"
				? sql`date_trunc('week', timezone('UTC', ${tasks.completedAt}))`
				: sql`date_trunc('day', timezone('UTC', ${tasks.completedAt}))`;

	const activityCount = count(activityLogs.id);

	const completedActionCount = sql<number>`
		count(*) filter (
			where ${activityLogs.action} = 'task_completed'
		)
	`.mapWith(Number);

	const [
		taskMetricRows,
		activityMetricRows,
		createdTrendRows,
		completedTrendRows,
		taskHealthRows,
		priorityRows,
		projectProgressRows,
		contributorRows,
	] = await Promise.all([
		db
			.select({
				completedCurrent: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} >= ${ranges.currentStart}
						and ${tasks.completedAt} < ${ranges.currentEnd}
					)
				`.mapWith(Number),

				completedPrevious: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} >= ${ranges.previousStart}
						and ${tasks.completedAt} < ${ranges.previousEnd}
					)
				`.mapWith(Number),

				avgCompletionDaysCurrent: sql<string | null>`
					avg(
						extract(
							epoch from (
								${tasks.completedAt} - ${tasks.createdAt}
							)
						) / 86400.0
					) filter (
						where ${tasks.completedAt} >= ${ranges.currentStart}
						and ${tasks.completedAt} < ${ranges.currentEnd}
						and ${tasks.completedAt} >= ${tasks.createdAt}
					)
				`,

				avgCompletionDaysPrevious: sql<string | null>`
					avg(
						extract(
							epoch from (
								${tasks.completedAt} - ${tasks.createdAt}
							)
						) / 86400.0
					) filter (
						where ${tasks.completedAt} >= ${ranges.previousStart}
						and ${tasks.completedAt} < ${ranges.previousEnd}
						and ${tasks.completedAt} >= ${tasks.createdAt}
					)
				`,

				onTimeCurrent: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} >= ${ranges.currentStart}
						and ${tasks.completedAt} < ${ranges.currentEnd}
						and ${tasks.dueDate} is not null
						and date(
							timezone('UTC', ${tasks.completedAt})
						) <= date(
							timezone('UTC', ${tasks.dueDate})
						)
					)
				`.mapWith(Number),

				scheduledCurrent: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} >= ${ranges.currentStart}
						and ${tasks.completedAt} < ${ranges.currentEnd}
						and ${tasks.dueDate} is not null
					)
				`.mapWith(Number),

				onTimePrevious: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} >= ${ranges.previousStart}
						and ${tasks.completedAt} < ${ranges.previousEnd}
						and ${tasks.dueDate} is not null
						and date(
							timezone('UTC', ${tasks.completedAt})
						) <= date(
							timezone('UTC', ${tasks.dueDate})
						)
					)
				`.mapWith(Number),

				scheduledPrevious: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} >= ${ranges.previousStart}
						and ${tasks.completedAt} < ${ranges.previousEnd}
						and ${tasks.dueDate} is not null
					)
				`.mapWith(Number),
			})
			.from(tasks)
			.innerJoin(stages, eq(tasks.stageId, stages.id))
			.where(inArray(stages.projectId, projectIds)),

		db
			.select({
				current: sql<number>`
					count(
						distinct ${activityLogs.actorId}
					) filter (
						where ${activityLogs.createdAt} >= ${ranges.currentStart}
						and ${activityLogs.createdAt} < ${ranges.currentEnd}
						and ${activityLogs.actorId} is not null
					)
				`.mapWith(Number),

				previous: sql<number>`
					count(
						distinct ${activityLogs.actorId}
					) filter (
						where ${activityLogs.createdAt} >= ${ranges.previousStart}
						and ${activityLogs.createdAt} < ${ranges.previousEnd}
						and ${activityLogs.actorId} is not null
					)
				`.mapWith(Number),
			})
			.from(activityLogs)
			.where(
				and(
					inArray(activityLogs.projectId, projectIds),

					gte(activityLogs.createdAt, ranges.previousStart),

					lt(activityLogs.createdAt, ranges.currentEnd),
				),
			),

		db
			.select({
				bucket: sql<string>`
					to_char(
						${createdBucket},
						'YYYY-MM-DD'
					)
				`,

				count: count(tasks.id),
			})
			.from(tasks)
			.innerJoin(stages, eq(tasks.stageId, stages.id))
			.where(
				and(
					inArray(stages.projectId, projectIds),

					gte(tasks.createdAt, ranges.currentStart),

					lt(tasks.createdAt, ranges.currentEnd),
				),
			)
			.groupBy(createdBucket)
			.orderBy(createdBucket),

		db
			.select({
				bucket: sql<string>`
					to_char(
						${completedBucket},
						'YYYY-MM-DD'
					)
				`,

				count: count(tasks.id),
			})
			.from(tasks)
			.innerJoin(stages, eq(tasks.stageId, stages.id))
			.where(
				and(
					inArray(stages.projectId, projectIds),

					gte(tasks.completedAt, ranges.currentStart),

					lt(tasks.completedAt, ranges.currentEnd),
				),
			)
			.groupBy(completedBucket)
			.orderBy(completedBucket),

		db
			.select({
				total: count(tasks.id),

				completed: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} is not null
					)
				`.mapWith(Number),

				overdue: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} is null
						and ${tasks.dueDate} is not null
						and ${tasks.dueDate} < ${todayStart}
					)
				`.mapWith(Number),

				open: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} is null
						and (
							${tasks.dueDate} is null
							or ${tasks.dueDate} >= ${todayStart}
						)
					)
				`.mapWith(Number),
			})
			.from(tasks)
			.innerJoin(stages, eq(tasks.stageId, stages.id))
			.where(
				and(
					inArray(stages.projectId, projectIds),

					isNull(tasks.archivedAt),
				),
			),

		db
			.select({
				urgent: sql<number>`
					count(*) filter (
						where ${tasks.priority} = 'urgent'
					)
				`.mapWith(Number),

				high: sql<number>`
					count(*) filter (
						where ${tasks.priority} = 'high'
					)
				`.mapWith(Number),

				medium: sql<number>`
					count(*) filter (
						where ${tasks.priority} = 'medium'
					)
				`.mapWith(Number),

				low: sql<number>`
					count(*) filter (
						where ${tasks.priority} = 'low'
					)
				`.mapWith(Number),

				none: sql<number>`
					count(*) filter (
						where ${tasks.priority} is null
					)
				`.mapWith(Number),
			})
			.from(tasks)
			.innerJoin(stages, eq(tasks.stageId, stages.id))
			.where(
				and(
					inArray(stages.projectId, projectIds),

					isNull(tasks.archivedAt),

					isNull(tasks.completedAt),
				),
			),

		db
			.select({
				projectId: stages.projectId,

				total: count(tasks.id),

				completed: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} is not null
					)
				`.mapWith(Number),

				overdue: sql<number>`
					count(*) filter (
						where ${tasks.completedAt} is null
						and ${tasks.dueDate} is not null
						and ${tasks.dueDate} < ${todayStart}
					)
				`.mapWith(Number),
			})
			.from(tasks)
			.innerJoin(stages, eq(tasks.stageId, stages.id))
			.where(
				and(
					inArray(stages.projectId, projectIds),

					or(isNull(tasks.archivedAt), isNotNull(tasks.completedAt)),
				),
			)
			.groupBy(stages.projectId),

		db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				imageUrl: users.imageUrl,
				jobTitle: users.jobTitle,

				activityCount,

				completedCount: completedActionCount,
			})
			.from(activityLogs)
			.innerJoin(users, eq(activityLogs.actorId, users.id))
			.where(
				and(
					inArray(activityLogs.projectId, projectIds),

					gte(activityLogs.createdAt, ranges.currentStart),

					lt(activityLogs.createdAt, ranges.currentEnd),
				),
			)
			.groupBy(
				users.id,
				users.name,
				users.email,
				users.imageUrl,
				users.jobTitle,
			)
			.orderBy(desc(activityCount), desc(completedActionCount)),
	]);

	const taskMetric = taskMetricRows[0];
	const activityMetric = activityMetricRows[0];
	const taskHealth = taskHealthRows[0];
	const priority = priorityRows[0];

	const completedCurrent = taskMetric?.completedCurrent ?? 0;

	const completedPrevious = taskMetric?.completedPrevious ?? 0;

	const avgCompletionDaysCurrent = toNullableNumber(
		taskMetric?.avgCompletionDaysCurrent,
	);

	const avgCompletionDaysPrevious = toNullableNumber(
		taskMetric?.avgCompletionDaysPrevious,
	);

	const scheduledCurrent = taskMetric?.scheduledCurrent ?? 0;

	const scheduledPrevious = taskMetric?.scheduledPrevious ?? 0;

	const onTimeCurrent = taskMetric?.onTimeCurrent ?? 0;

	const onTimePrevious = taskMetric?.onTimePrevious ?? 0;

	const progressByProjectId = new Map(
		projectProgressRows.map((row) => [row.projectId, row]),
	);

	const allProgress = scopedProjects
		.map((project) => {
			const progress = progressByProjectId.get(project.id);

			const totalTasks = progress?.total ?? 0;

			const completedTasks = progress?.completed ?? 0;

			const overdueTasks = progress?.overdue ?? 0;

			return {
				id: project.id,
				name: project.name,
				color: project.color,
				totalTasks,
				completedTasks,

				openTasks: Math.max(0, totalTasks - completedTasks),

				overdueTasks,

				completionRate:
					totalTasks === 0
						? 0
						: Math.round((completedTasks / totalTasks) * 100),
			};
		})
		.filter((project) => project.totalTasks > 0)
		.sort(
			(left, right) =>
				right.totalTasks - left.totalTasks ||
				left.name.localeCompare(right.name),
		);

	const priorityOrder: AnalyticsPriority[] = [
		"urgent",
		"high",
		"medium",
		"low",
		"none",
	];

	const priorityCounts: Record<AnalyticsPriority, number> = {
		urgent: priority?.urgent ?? 0,
		high: priority?.high ?? 0,
		medium: priority?.medium ?? 0,
		low: priority?.low ?? 0,
		none: priority?.none ?? 0,
	};

	return {
		hasProjects: accessibleProjects.length > 0,

		filters: {
			period: input.period,
			periodLabel: periodOption.label,
			selectedProjectId,
		},

		projectOptions,

		overview: {
			completedTasks: createMetric(completedCurrent, completedPrevious),

			avgCompletionDays: createMetric(
				avgCompletionDaysCurrent,
				avgCompletionDaysPrevious,
			),

			onTimeRate: {
				...createMetric(
					getRate(onTimeCurrent, scheduledCurrent),

					getRate(onTimePrevious, scheduledPrevious),
				),

				sampleSize: scheduledCurrent,
			},

			activeCollaborators: createMetric(
				activityMetric?.current ?? 0,
				activityMetric?.previous ?? 0,
			),
		},

		trend: buildTrendSeries(
			input.period,
			ranges.currentStart,
			ranges.currentEnd,
			createdTrendRows,
			completedTrendRows,
		),

		taskHealth: {
			total: taskHealth?.total ?? 0,
			completed: taskHealth?.completed ?? 0,
			open: taskHealth?.open ?? 0,
			overdue: taskHealth?.overdue ?? 0,
		},

		priorityDistribution: priorityOrder.map((priorityKey) => ({
			priority: priorityKey,
			count: priorityCounts[priorityKey],
		})),

		projectProgress: allProgress,

		contributors: contributorRows.map((row) => ({
			user: {
				id: row.id,
				name: row.name,
				email: row.email,
				imageUrl: row.imageUrl,
				jobTitle: row.jobTitle,
			},

			activityCount: row.activityCount,

			completedCount: row.completedCount,
		})),
	};
}
