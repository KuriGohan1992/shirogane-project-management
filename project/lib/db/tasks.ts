import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { getProjectAccess } from "@/lib/db/project-access";
import { type NewTask, type Task, tasks } from "@/lib/db/schema";

type TaskMutationData = Pick<
	NewTask,
	"title" | "description" | "priority" | "dueDate"
>;

type TaskMutationResult = {
	task: Task;
	projectId: string;
};

async function getEditableStage(stageId: string, userId: string) {
	const stage = await db.query.stages.findFirst({
		columns: {
			id: true,
			projectId: true,
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

	return existingTask.stage.projectId;
}
