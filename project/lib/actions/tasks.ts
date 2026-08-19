"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	createTaskInStage,
	deleteTaskForUser,
	moveTaskForUser,
	updateTaskForUser,
} from "@/lib/db/tasks";
import { labelIdSchema } from "@/lib/validations/label";
import { stageIdSchema } from "@/lib/validations/stage";
import { taskFormSchema, taskIdSchema } from "@/lib/validations/task";
import type { BoardMutationResult } from "@/types/board";
import type { TaskActionState } from "@/types/task";

function parseDate(value: string): Date | null {
	if (!value) {
		return null;
	}

	return new Date(`${value}T00:00:00.000Z`);
}

export async function createTask(
	stageId: string,
	_previousState: TaskActionState,
	formData: FormData,
): Promise<TaskActionState> {
	const stageIdResult = stageIdSchema.safeParse(stageId);

	if (!stageIdResult.success) {
		return {
			success: false,
			message: "The selected stage is invalid.",
		};
	}

	const result = taskFormSchema.safeParse({
		title: formData.get("title"),
		description: formData.get("description"),
		priority: formData.get("priority"),
		startDate: formData.get("startDate"),
		dueDate: formData.get("dueDate"),
	});

	const labelIdsResult = z
		.array(labelIdSchema)
		.safeParse(formData.getAll("labelIds"));

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	if (!labelIdsResult.success) {
		return {
			success: false,
			message: "One or more selected labels are invalid.",
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const created = await createTaskInStage(
			stageIdResult.data,
			user.id,
			{
				title: result.data.title,
				description: result.data.description || null,
				priority: result.data.priority,
				startDate: parseDate(result.data.startDate),
				dueDate: parseDate(result.data.dueDate),
			},
			labelIdsResult.data,
		);

		if (!created) {
			return {
				success: false,
				message: "You do not have permission to create a task in this stage.",
			};
		}

		revalidatePath(`/projects/${created.projectId}`);

		return {
			success: true,
			message: "Task created.",
		};
	} catch (error) {
		console.error("Failed to create task:", error);

		return {
			success: false,
			message: "Something went wrong while creating the task.",
		};
	}
}

export async function updateTask(
	taskId: string,
	_previousState: TaskActionState,
	formData: FormData,
): Promise<TaskActionState> {
	const taskIdResult = taskIdSchema.safeParse(taskId);

	if (!taskIdResult.success) {
		return {
			success: false,
			message:
				"The task could not be found or you do not have permission to edit it.",
		};
	}

	const result = taskFormSchema.safeParse({
		title: formData.get("title"),
		description: formData.get("description"),
		priority: formData.get("priority"),
		startDate: formData.get("startDate"),
		dueDate: formData.get("dueDate"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const updated = await updateTaskForUser(taskIdResult.data, user.id, {
			title: result.data.title,
			description: result.data.description || null,
			priority: result.data.priority,
			startDate: parseDate(result.data.startDate),
			dueDate: parseDate(result.data.dueDate),
		});

		if (!updated) {
			return {
				success: false,
				message:
					"The task could not be found or you do not have permission to edit it.",
			};
		}

		revalidatePath(`/projects/${updated.projectId}`);

		return {
			success: true,
			message: "Task updated.",
		};
	} catch (error) {
		console.error("Failed to update task:", error);

		return {
			success: false,
			message: "Something went wrong while updating the task.",
		};
	}
}

export async function deleteTask(
	taskId: string,
	_formData: FormData,
): Promise<void> {
	const taskIdResult = taskIdSchema.safeParse(taskId);

	if (!taskIdResult.success) {
		throw new Error(
			"The task could not be found or you do not have permission to delete it.",
		);
	}

	const user = await getCurrentDatabaseUser();

	const projectId = await deleteTaskForUser(taskIdResult.data, user.id);

	if (!projectId) {
		throw new Error(
			"The task could not be found or you do not have permission to delete it.",
		);
	}

	revalidatePath(`/projects/${projectId}`);
}

export async function moveTaskOnBoard(
	taskId: string,
	targetStageId: string,
	targetIndex: number,
): Promise<BoardMutationResult> {
	const taskIdResult = taskIdSchema.safeParse(taskId);

	const targetStageIdResult = stageIdSchema.safeParse(targetStageId);

	const targetIndexResult = z
		.number()
		.int()
		.nonnegative()
		.safeParse(targetIndex);

	if (
		!taskIdResult.success ||
		!targetStageIdResult.success ||
		!targetIndexResult.success
	) {
		return {
			success: false,
			message: "The requested task movement is invalid.",
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const projectId = await moveTaskForUser(
			taskIdResult.data,
			targetStageIdResult.data,
			user.id,
			targetIndexResult.data,
		);

		if (!projectId) {
			return {
				success: false,
				message: "You do not have permission to move this task.",
			};
		}

		revalidatePath(`/projects/${projectId}`);

		return {
			success: true,
		};
	} catch (error) {
		console.error("Failed to move task:", error);

		return {
			success: false,
			message: "Something went wrong while moving the task.",
		};
	}
}
