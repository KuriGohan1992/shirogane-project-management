import "server-only";

import { and, eq, inArray, isNull } from "drizzle-orm";

import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { recordTaskActivity } from "@/lib/db/activity";
import { getProjectAccess } from "@/lib/db/project-access";
import {
	type NewTask,
	projectLabels,
	type Task,
	taskLabels,
	tasks,
} from "@/lib/db/schema";

type TaskMutationData = Pick<
	NewTask,
	"title" | "description" | "priority" | "startDate" | "dueDate"
>;

type TaskMutationResult = {
	task: Task;
	projectId: string;
};

function datesMatch(left: Date | null, right: Date | null) {
	return left?.getTime() === right?.getTime();
}

function getChangedTaskFields(task: Task, data: TaskMutationData) {
	const changedFields: string[] = [];

	if (task.title !== data.title) {
		changedFields.push("title");
	}

	if (task.description !== data.description) {
		changedFields.push("description");
	}

	if (task.priority !== data.priority) {
		changedFields.push("priority");
	}

	if (!datesMatch(task.startDate, data.startDate ?? null)) {
		changedFields.push("start date");
	}

	if (!datesMatch(task.dueDate, data.dueDate ?? null)) {
		changedFields.push("due date");
	}

	return changedFields;
}

async function getEditableStage(stageId: string, userId: string) {
	const stage = await db.query.stages.findFirst({
		columns: {
			id: true,
			projectId: true,
			name: true,
		},

		where: (stage, { eq }) => eq(stage.id, stageId),
	});

	if (!stage) {
		return undefined;
	}

	const accessRole = await getProjectAccess(stage.projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canManageTasks) {
		return undefined;
	}

	return stage;
}

async function getEditableTask(taskId: string, userId: string) {
	const task = await db.query.tasks.findFirst({
		where: (task, { and, eq, isNull }) =>
			and(eq(task.id, taskId), isNull(task.archivedAt)),

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

export async function createTaskInStage(
	stageId: string,
	ownerId: string,
	data: TaskMutationData,
	labelIds: string[] = [],
): Promise<TaskMutationResult | undefined> {
	const stage = await getEditableStage(stageId, ownerId);

	if (!stage) {
		return undefined;
	}

	const lastTask = await db.query.tasks.findFirst({
		where: (task, { and, eq, isNull }) =>
			and(eq(task.stageId, stageId), isNull(task.archivedAt)),

		orderBy: (task, { desc }) => [desc(task.position)],
	});

	const position = (lastTask?.position ?? -1000) + 1000;

	const [task] = await db
		.insert(tasks)
		.values({
			stageId,
			position,
			...data,
		})
		.returning();

	if (!task) {
		throw new Error("Failed to create task.");
	}

	const uniqueLabelIds = [...new Set(labelIds)];

	if (uniqueLabelIds.length > 0) {
		const validLabels = await db
			.select({
				id: projectLabels.id,
			})
			.from(projectLabels)
			.where(
				and(
					eq(projectLabels.projectId, stage.projectId),
					inArray(projectLabels.id, uniqueLabelIds),
				),
			);

		if (validLabels.length > 0) {
			await db
				.insert(taskLabels)
				.values(
					validLabels.map((label) => ({
						taskId: task.id,
						labelId: label.id,
					})),
				)
				.onConflictDoNothing();
		}
	}

	await recordTaskActivity({
		projectId: stage.projectId,
		taskId: task.id,
		actorId: ownerId,
		action: "task_created",
		taskTitle: task.title,
		metadata: {
			stageName: stage.name,
		},
	});

	return {
		task,
		projectId: stage.projectId,
	};
}

export async function updateTaskForUser(
	taskId: string,
	ownerId: string,
	data: TaskMutationData,
): Promise<TaskMutationResult | undefined> {
	const existingTask = await getEditableTask(taskId, ownerId);

	if (!existingTask) {
		return undefined;
	}

	const changedFields = getChangedTaskFields(existingTask, data);

	const [task] = await db
		.update(tasks)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(and(eq(tasks.id, taskId), isNull(tasks.archivedAt)))
		.returning();

	if (!task) {
		return undefined;
	}

	if (changedFields.length > 0) {
		await recordTaskActivity({
			projectId: existingTask.stage.projectId,
			taskId: task.id,
			actorId: ownerId,
			action: "task_updated",
			taskTitle: task.title,
			metadata: {
				changedFields: changedFields.join(", "),
			},
		});
	}

	return {
		task,
		projectId: existingTask.stage.projectId,
	};
}

export async function deleteTaskForUser(
	taskId: string,
	ownerId: string,
): Promise<string | undefined> {
	const existingTask = await getEditableTask(taskId, ownerId);

	if (!existingTask) {
		return undefined;
	}

	const [deletedTask] = await db
		.delete(tasks)
		.where(and(eq(tasks.id, taskId), isNull(tasks.archivedAt)))
		.returning({
			id: tasks.id,
		});

	if (!deletedTask) {
		return undefined;
	}

	await recordTaskActivity({
		projectId: existingTask.stage.projectId,
		taskId: null,
		actorId: ownerId,
		action: "task_deleted",
		taskTitle: existingTask.title,
		metadata: {
			stageName: existingTask.stage.name,
		},
	});

	return existingTask.stage.projectId;
}

export async function moveTaskForUser(
	taskId: string,
	targetStageId: string,
	userId: string,
	targetIndex: number,
): Promise<string | undefined> {
	const existingTask = await getEditableTask(taskId, userId);

	if (!existingTask) {
		return undefined;
	}

	const targetStage = await db.query.stages.findFirst({
		columns: {
			id: true,
			projectId: true,
			name: true,
		},

		where: (stage, { eq }) => eq(stage.id, targetStageId),
	});

	if (!targetStage || targetStage.projectId !== existingTask.stage.projectId) {
		return undefined;
	}

	const sourceStageId = existingTask.stageId;

	// Reorder inside the same Stage.
	if (sourceStageId === targetStage.id) {
		const stageTasks = await db.query.tasks.findMany({
			where: (task, { and, eq, isNull }) =>
				and(eq(task.stageId, sourceStageId), isNull(task.archivedAt)),

			orderBy: (task, { asc }) => [asc(task.position)],
		});

		const currentIndex = stageTasks.findIndex(
			(task) => task.id === existingTask.id,
		);

		if (currentIndex === -1) {
			return undefined;
		}

		const reorderedTasks = [...stageTasks];

		const [movedTask] = reorderedTasks.splice(currentIndex, 1);

		if (!movedTask) {
			return undefined;
		}

		const boundedTargetIndex = Math.min(
			Math.max(targetIndex, 0),
			reorderedTasks.length,
		);

		reorderedTasks.splice(boundedTargetIndex, 0, movedTask);

		const updatedAt = new Date();

		const updates = reorderedTasks.map((task, index) =>
			db
				.update(tasks)
				.set({
					position: index * 1000,
					updatedAt,
				})
				.where(
					and(
						eq(tasks.id, task.id),
						eq(tasks.stageId, sourceStageId),
						isNull(tasks.archivedAt),
					),
				),
		);

		const [firstUpdate, ...remainingUpdates] = updates;

		if (firstUpdate) {
			await db.batch([firstUpdate, ...remainingUpdates]);
		}

		return targetStage.projectId;
	}

	// Move between different Stages.
	const [sourceTasks, targetTasks] = await Promise.all([
		db.query.tasks.findMany({
			where: (task, { and, eq, isNull }) =>
				and(eq(task.stageId, sourceStageId), isNull(task.archivedAt)),

			orderBy: (task, { asc }) => [asc(task.position)],
		}),

		db.query.tasks.findMany({
			where: (task, { and, eq, isNull }) =>
				and(eq(task.stageId, targetStage.id), isNull(task.archivedAt)),

			orderBy: (task, { asc }) => [asc(task.position)],
		}),
	]);

	const movedTask = sourceTasks.find((task) => task.id === existingTask.id);

	if (!movedTask) {
		return undefined;
	}

	const nextSourceTasks = sourceTasks.filter(
		(task) => task.id !== existingTask.id,
	);

	const nextTargetTasks = [...targetTasks];

	const boundedTargetIndex = Math.min(
		Math.max(targetIndex, 0),
		nextTargetTasks.length,
	);

	nextTargetTasks.splice(boundedTargetIndex, 0, movedTask);

	const updatedAt = new Date();

	const sourceUpdates = nextSourceTasks.map((task, index) =>
		db
			.update(tasks)
			.set({
				position: index * 1000,
				updatedAt,
			})
			.where(
				and(
					eq(tasks.id, task.id),
					eq(tasks.stageId, sourceStageId),
					isNull(tasks.archivedAt),
				),
			),
	);

	const targetUpdates = nextTargetTasks.map((task, index) =>
		db
			.update(tasks)
			.set({
				stageId: targetStage.id,
				position: index * 1000,
				updatedAt,
			})
			.where(and(eq(tasks.id, task.id), isNull(tasks.archivedAt))),
	);

	const updates = [...sourceUpdates, ...targetUpdates];

	const [firstUpdate, ...remainingUpdates] = updates;

	if (firstUpdate) {
		await db.batch([firstUpdate, ...remainingUpdates]);
	}

	await recordTaskActivity({
		projectId: targetStage.projectId,
		taskId: existingTask.id,
		actorId: userId,
		action: "task_moved",
		taskTitle: existingTask.title,
		metadata: {
			fromStage: existingTask.stage.name,
			toStage: targetStage.name,
		},
	});

	return targetStage.projectId;
}
