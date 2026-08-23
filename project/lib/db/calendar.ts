import "server-only";

import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import { toDateKey } from "@/lib/calendar-dates";
import { db } from "@/lib/db";
import { getProjectsForUser } from "@/lib/db/projects";
import { stages, taskAssignees, tasks } from "@/lib/db/schema";
import type {
	CalendarProjectSummary,
	CalendarProjectTask,
} from "@/types/calendar";

export async function getCalendarProjectsForUser(
	userId: string,
): Promise<CalendarProjectSummary[]> {
	const projects = await getProjectsForUser(userId);

	if (projects.length === 0) {
		return [];
	}

	const projectIds = projects.map((project) => project.id);

	const assignedTasks = await db
		.select({
			id: tasks.id,
			title: tasks.title,
			priority: tasks.priority,
			dueDate: tasks.dueDate,
			projectId: stages.projectId,
			stageName: stages.name,
		})
		.from(taskAssignees)
		.innerJoin(tasks, eq(taskAssignees.taskId, tasks.id))
		.innerJoin(stages, eq(tasks.stageId, stages.id))
		.where(
			and(
				eq(taskAssignees.userId, userId),
				inArray(stages.projectId, projectIds),
				isNull(tasks.archivedAt),
			),
		)
		.orderBy(asc(stages.position), asc(tasks.position));

	const tasksByProjectId = new Map<string, CalendarProjectTask[]>();

	for (const task of assignedTasks) {
		const projectTasks = tasksByProjectId.get(task.projectId) ?? [];

		projectTasks.push({
			id: task.id,
			title: task.title,
			priority: task.priority,
			dueDate: task.dueDate ? toDateKey(task.dueDate) : null,
			stageName: task.stageName,
		});

		tasksByProjectId.set(task.projectId, projectTasks);
	}

	return projects.map((project) => ({
		id: project.id,
		name: project.name,
		description: project.description,
		color: project.color,
		startDate: project.startDate ? toDateKey(project.startDate) : null,
		dueDate: project.dueDate ? toDateKey(project.dueDate) : null,
		completedAt: project.completedAt?.toISOString() ?? null,
		lastActivityAt: project.lastActivityAt.toISOString(),
		accessRole: project.accessRole,
		owner: project.owner,
		myTasks: tasksByProjectId.get(project.id) ?? [],
	}));
}
