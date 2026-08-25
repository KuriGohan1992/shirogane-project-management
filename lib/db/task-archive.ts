import "server-only";

import { and, count, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { recordTaskActivity } from "@/lib/db/activity";
import { getProjectAccess } from "@/lib/db/project-access";
import { stages, tasks } from "@/lib/db/schema";
import type { ArchivedTaskSummary } from "@/types/task";

async function getManageableTaskArchiveContext(taskId: string, userId: string) {
	const task = await db.query.tasks.findFirst({
		columns: {
			id: true,
			stageId: true,
			title: true,
			archivedAt: true,
		},

		where: (task, { eq }) => eq(task.id, taskId),

		with: {
			stage: {
				columns: {
					projectId: true,
					name: true,
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

export async function getArchivedTaskCountForProject(projectId: string) {
	const [row] = await db
		.select({
			total: count(),
		})
		.from(tasks)
		.innerJoin(stages, eq(tasks.stageId, stages.id))
		.where(and(eq(stages.projectId, projectId), isNotNull(tasks.archivedAt)));

	return row?.total ?? 0;
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
			completedAt: tasks.completedAt,
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

	await recordTaskActivity({
		projectId: task.stage.projectId,
		taskId: task.id,
		actorId: userId,
		action: "task_archived",
		taskTitle: task.title,
		metadata: {
			stageName: task.stage.name,
		},
	});

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

	await recordTaskActivity({
		projectId: task.stage.projectId,
		taskId: task.id,
		actorId: userId,
		action: "task_restored",
		taskTitle: task.title,
		metadata: {
			stageName: task.stage.name,
		},
	});

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

	await recordTaskActivity({
		projectId: task.stage.projectId,
		taskId: null,
		actorId: userId,
		action: "task_deleted",
		taskTitle: task.title,
		metadata: {
			stageName: task.stage.name,
		},
	});

	return task.stage.projectId;
}

export async function restoreAllArchivedTasksForUser(
	projectId: string,
	userId: string,
): Promise<number | undefined> {
	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canManageTasks) {
		return undefined;
	}

	const projectStages = await db.query.stages.findMany({
		columns: {
			id: true,
			name: true,
		},

		where: (stage, { eq }) => eq(stage.projectId, projectId),
	});

	const stageIds = projectStages.map((stage) => stage.id);

	if (stageIds.length === 0) {
		return 0;
	}

	const archivedTasks = await db.query.tasks.findMany({
		columns: {
			id: true,
			stageId: true,
			title: true,
			archivedAt: true,
			position: true,
		},

		where: (task, { and, inArray, isNotNull }) =>
			and(inArray(task.stageId, stageIds), isNotNull(task.archivedAt)),

		orderBy: (task, { asc }) => [asc(task.archivedAt)],
	});

	if (archivedTasks.length === 0) {
		return 0;
	}

	const affectedStageIds = [
		...new Set(archivedTasks.map((task) => task.stageId)),
	];

	const activeTasks = await db.query.tasks.findMany({
		columns: {
			stageId: true,
			position: true,
		},

		where: (task, { and, inArray, isNull }) =>
			and(inArray(task.stageId, affectedStageIds), isNull(task.archivedAt)),
	});

	const nextPositionByStage = new Map<string, number>();

	for (const stageId of affectedStageIds) {
		const highestPosition = activeTasks
			.filter((task) => task.stageId === stageId)
			.reduce((highest, task) => Math.max(highest, task.position), -1000);

		nextPositionByStage.set(stageId, highestPosition + 1000);
	}

	const restoredAt = new Date();

	const updates = archivedTasks.map((task) => {
		const position = nextPositionByStage.get(task.stageId) ?? 0;

		nextPositionByStage.set(task.stageId, position + 1000);

		return db
			.update(tasks)
			.set({
				archivedAt: null,
				position,
				updatedAt: restoredAt,
			})
			.where(and(eq(tasks.id, task.id), isNotNull(tasks.archivedAt)));
	});

	const [firstUpdate, ...remainingUpdates] = updates;

	if (firstUpdate) {
		await db.batch([firstUpdate, ...remainingUpdates]);
	}

	const stageNameById = new Map(
		projectStages.map((stage) => [stage.id, stage.name]),
	);

	await Promise.all(
		archivedTasks.map((task) =>
			recordTaskActivity({
				projectId,
				taskId: task.id,
				actorId: userId,
				action: "task_restored",
				taskTitle: task.title,
				metadata: {
					stageName: stageNameById.get(task.stageId),
				},
			}),
		),
	);

	return archivedTasks.length;
}

export async function deleteAllArchivedTasksForUser(
	projectId: string,
	userId: string,
): Promise<number | undefined> {
	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canManageTasks) {
		return undefined;
	}

	const projectStages = await db.query.stages.findMany({
		columns: {
			id: true,
			name: true,
		},

		where: (stage, { eq }) => eq(stage.projectId, projectId),
	});

	const stageIds = projectStages.map((stage) => stage.id);

	if (stageIds.length === 0) {
		return 0;
	}

	const archivedTasks = await db.query.tasks.findMany({
		columns: {
			id: true,
			stageId: true,
			title: true,
		},

		where: (task, { and, inArray, isNotNull }) =>
			and(inArray(task.stageId, stageIds), isNotNull(task.archivedAt)),
	});

	if (archivedTasks.length === 0) {
		return 0;
	}

	await db.delete(tasks).where(
		and(
			inArray(
				tasks.id,
				archivedTasks.map((task) => task.id),
			),
			isNotNull(tasks.archivedAt),
		),
	);

	const stageNameById = new Map(
		projectStages.map((stage) => [stage.id, stage.name]),
	);

	await Promise.all(
		archivedTasks.map((task) =>
			recordTaskActivity({
				projectId,
				taskId: null,
				actorId: userId,
				action: "task_deleted",
				taskTitle: task.title,
				metadata: {
					stageName: stageNameById.get(task.stageId),
				},
			}),
		),
	);

	return archivedTasks.length;
}
