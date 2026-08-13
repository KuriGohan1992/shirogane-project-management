import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { type NewTask, type Task, tasks } from "@/lib/db/schema";

type TaskMutationData = Pick<
	NewTask,
	"title" | "description" | "priority" | "dueDate"
>;

type TaskMutationResult = {
	task: Task;
	projectId: string;
};

async function getOwnedStage(stageId: string, ownerId: string) {
	const stage = await db.query.stages.findFirst({
		where: (stage, { eq }) => eq(stage.id, stageId),
		with: {
			project: true,
		},
	});

	if (!stage || stage.project.ownerId !== ownerId) {
		return undefined;
	}

	return stage;
}

async function getOwnedTask(taskId: string, ownerId: string) {
	const task = await db.query.tasks.findFirst({
		where: (task, { and, eq, isNull }) =>
			and(eq(task.id, taskId), isNull(task.archivedAt)),
		with: {
			stage: {
				with: {
					project: true,
				},
			},
		},
	});

	if (!task || task.stage.project.ownerId !== ownerId) {
		return undefined;
	}

	return task;
}

export async function createTaskInOwnedStage(
	stageId: string,
	ownerId: string,
	data: TaskMutationData,
): Promise<TaskMutationResult | undefined> {
	const stage = await getOwnedStage(stageId, ownerId);

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

	return {
		task,
		projectId: stage.projectId,
	};
}

export async function updateTaskOwnedByUser(
	taskId: string,
	ownerId: string,
	data: TaskMutationData,
): Promise<TaskMutationResult | undefined> {
	const existingTask = await getOwnedTask(taskId, ownerId);

	if (!existingTask) {
		return undefined;
	}

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

	return {
		task,
		projectId: existingTask.stage.projectId,
	};
}

export async function deleteTaskOwnedByUser(
	taskId: string,
	ownerId: string,
): Promise<string | undefined> {
	const existingTask = await getOwnedTask(taskId, ownerId);

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

	return existingTask.stage.projectId;
}
