import "server-only";

import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";

import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { getProjectAccess } from "@/lib/db/project-access";
import { stages, tasks } from "@/lib/db/schema";
import type { ArchivedTaskSummary } from "@/types/task";

async function getManageableTaskArchiveContext(taskId: string, userId: string) {
	const task = await db.query.tasks.findFirst({
		columns: {
			id: true,
			stageId: true,
			archivedAt: true,
		},

		where: (task, { eq }) => eq(task.id, taskId),

		with: {
			stage: {
				columns: {
					projectId: true,
				},
			},
		},
	});

	if (!task) {
		return undefined;
	}

	const accessRole = await getProjectAccess(task.stage.projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canManageTasks) {
		return undefined;
	}

	return task;
}

export async function getArchivedTasksForProject(
	projectId: string,
	userId: string,
): Promise<ArchivedTaskSummary[]> {
	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole) {
		return [];
	}

	const archivedTasks = await db
		.select({
			id: tasks.id,
			title: tasks.title,
			priority: tasks.priority,
			archivedAt: tasks.archivedAt,
			stageName: stages.name,
		})
		.from(tasks)
		.innerJoin(stages, eq(tasks.stageId, stages.id))
		.where(and(eq(stages.projectId, projectId), isNotNull(tasks.archivedAt)))
		.orderBy(desc(tasks.archivedAt));

	return archivedTasks.flatMap((task) =>
		task.archivedAt
			? [
					{
						...task,
						archivedAt: task.archivedAt,
					},
				]
			: [],
	);
}

export async function archiveTaskForUser(
	taskId: string,
	userId: string,
): Promise<string | undefined> {
	const task = await getManageableTaskArchiveContext(taskId, userId);

	if (!task || task.archivedAt) {
		return undefined;
	}

	const archivedAt = new Date();

	const [archivedTask] = await db
		.update(tasks)
		.set({
			archivedAt,
			updatedAt: archivedAt,
		})
		.where(and(eq(tasks.id, taskId), isNull(tasks.archivedAt)))
		.returning({
			id: tasks.id,
		});

	if (!archivedTask) {
		return undefined;
	}

	return task.stage.projectId;
}

export async function restoreArchivedTaskForUser(
	taskId: string,
	userId: string,
): Promise<string | undefined> {
	const task = await getManageableTaskArchiveContext(taskId, userId);

	if (!task?.archivedAt) {
		return undefined;
	}

	const lastActiveTask = await db.query.tasks.findFirst({
		columns: {
			position: true,
		},

		where: (candidate, { and, eq, isNull }) =>
			and(eq(candidate.stageId, task.stageId), isNull(candidate.archivedAt)),

		orderBy: (candidate, { desc }) => [desc(candidate.position)],
	});

	const position = (lastActiveTask?.position ?? -1000) + 1000;

	const updatedAt = new Date();

	const [restoredTask] = await db
		.update(tasks)
		.set({
			archivedAt: null,
			position,
			updatedAt,
		})
		.where(and(eq(tasks.id, taskId), isNotNull(tasks.archivedAt)))
		.returning({
			id: tasks.id,
		});

	if (!restoredTask) {
		return undefined;
	}

	return task.stage.projectId;
}

export async function deleteArchivedTaskForUser(
	taskId: string,
	userId: string,
): Promise<string | undefined> {
	const task = await getManageableTaskArchiveContext(taskId, userId);

	if (!task?.archivedAt) {
		return undefined;
	}

	const [deletedTask] = await db
		.delete(tasks)
		.where(and(eq(tasks.id, taskId), isNotNull(tasks.archivedAt)))
		.returning({
			id: tasks.id,
		});

	if (!deletedTask) {
		return undefined;
	}

	return task.stage.projectId;
}
