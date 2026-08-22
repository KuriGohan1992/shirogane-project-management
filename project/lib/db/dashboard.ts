import "server-only";

import { and, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { getProjectsForUser } from "@/lib/db/projects";
import {
	type Project,
	projects,
	stages,
	type Task,
	taskAssignees,
	tasks,
} from "@/lib/db/schema";
import type { ActivityWithActor } from "@/types/activity";
import type { ProjectWithAccess } from "@/types/project";

const DASHBOARD_ACTIVITY_LIMIT = 20;
const DASHBOARD_PROJECT_LIMIT = 4;

export type DashboardTaskSummary = Pick<
	Task,
	"id" | "title" | "priority" | "dueDate"
> & {
	projectId: string;
	projectName: string;
	projectColor: Project["color"];
	stageName: string;
};

export type DashboardActivitySummary = ActivityWithActor & {
	project: Pick<Project, "id" | "name" | "color">;
};

export type DashboardProjectSummary = ProjectWithAccess;

export type DashboardData = {
	hasProjects: boolean;

	stats: {
		activeProjectCount: number;
		assignedTaskCount: number;
		urgentTaskCount: number;
	};

	myTasks: DashboardTaskSummary[];

	recentProjects: DashboardProjectSummary[];

	recentActivity: DashboardActivitySummary[];
};

export async function getDashboardForUser(
	userId: string,
): Promise<DashboardData> {
	const accessibleProjects = await getProjectsForUser(userId);

	if (accessibleProjects.length === 0) {
		return {
			hasProjects: false,

			stats: {
				activeProjectCount: 0,
				assignedTaskCount: 0,
				urgentTaskCount: 0,
			},

			myTasks: [],
			recentProjects: [],
			recentActivity: [],
		};
	}

	const activeProjects = accessibleProjects.filter(
		(project) => project.completedAt === null,
	);

	const accessibleProjectIds = accessibleProjects.map((project) => project.id);

	const activeProjectIds = activeProjects.map((project) => project.id);

	const recentActivityPromise = db.query.activityLogs.findMany({
		where: (activity, { inArray }) =>
			inArray(activity.projectId, accessibleProjectIds),

		orderBy: (activity, { desc }) => [desc(activity.createdAt)],

		limit: DASHBOARD_ACTIVITY_LIMIT,

		with: {
			actor: {
				columns: {
					id: true,
					name: true,
					email: true,
					imageUrl: true,
				},
			},

			project: {
				columns: {
					id: true,
					name: true,
					color: true,
				},
			},
		},
	});

	if (activeProjectIds.length === 0) {
		const recentActivity = await recentActivityPromise;

		return {
			hasProjects: true,

			stats: {
				activeProjectCount: 0,
				assignedTaskCount: 0,
				urgentTaskCount: 0,
			},

			myTasks: [],
			recentProjects: [],
			recentActivity,
		};
	}

	const [assignedTaskCountRows, urgentTaskCountRows, myTasks, recentActivity] =
		await Promise.all([
			db
				.select({
					taskCount: count(taskAssignees.taskId),
				})
				.from(taskAssignees)
				.innerJoin(tasks, eq(taskAssignees.taskId, tasks.id))
				.innerJoin(stages, eq(tasks.stageId, stages.id))
				.where(
					and(
						eq(taskAssignees.userId, userId),
						inArray(stages.projectId, activeProjectIds),
						isNull(tasks.archivedAt),
					),
				),

			db
				.select({
					taskCount: count(tasks.id),
				})
				.from(tasks)
				.innerJoin(stages, eq(tasks.stageId, stages.id))
				.where(
					and(
						inArray(stages.projectId, activeProjectIds),
						isNull(tasks.archivedAt),
						eq(tasks.priority, "urgent"),
					),
				),

			db
				.select({
					id: tasks.id,
					title: tasks.title,
					priority: tasks.priority,
					dueDate: tasks.dueDate,
					projectId: projects.id,
					projectName: projects.name,
					projectColor: projects.color,
					stageName: stages.name,
				})
				.from(taskAssignees)
				.innerJoin(tasks, eq(taskAssignees.taskId, tasks.id))
				.innerJoin(stages, eq(tasks.stageId, stages.id))
				.innerJoin(projects, eq(stages.projectId, projects.id))
				.where(
					and(
						eq(taskAssignees.userId, userId),
						inArray(projects.id, activeProjectIds),
						isNull(tasks.archivedAt),
					),
				)
				.orderBy(
					sql`${tasks.dueDate} asc nulls last`,

					sql`
						case ${tasks.priority}
							when 'urgent' then 0
							when 'high' then 1
							when 'medium' then 2
							when 'low' then 3
							else 4
						end
					`,

					desc(tasks.updatedAt),
				),

			recentActivityPromise,
		]);

	const recentProjects = activeProjects.slice(0, DASHBOARD_PROJECT_LIMIT);

	return {
		hasProjects: true,

		stats: {
			activeProjectCount: activeProjects.length,

			assignedTaskCount: assignedTaskCountRows[0]?.taskCount ?? 0,

			urgentTaskCount: urgentTaskCountRows[0]?.taskCount ?? 0,
		},

		myTasks,

		recentProjects,

		recentActivity,
	};
}
