"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	addLabelToTasksForUser,
	archiveTasksForUser,
	assignUserToTasksForUser,
	deleteTasksForUser,
	moveTasksForUser,
	removeLabelFromTasksForUser,
	setTaskPriorityForUser,
	unassignUserFromTasksForUser,
} from "@/lib/db/task-bulk";
import { labelIdSchema } from "@/lib/validations/label";
import { projectIdSchema } from "@/lib/validations/project";
import { stageIdSchema } from "@/lib/validations/stage";
import { taskIdSchema } from "@/lib/validations/task";
import { userIdSchema } from "@/lib/validations/user";
import type { BoardMutationResult } from "@/types/board";

const BULK_TASK_LIMIT = 100;

const taskIdsSchema = z
	.array(taskIdSchema)
	.min(1)
	.max(BULK_TASK_LIMIT)
	.transform((taskIds) => [...new Set(taskIds)]);

const prioritySchema = z.enum(["low", "medium", "high", "urgent"]).nullable();

function invalidBulkSelection(): BoardMutationResult {
	return {
		success: false,
		message: "The selected tasks are invalid.",
	};
}

function bulkMutationFailed(): BoardMutationResult {
	return {
		success: false,
		message:
			"The selected tasks could not be updated or you do not have permission to update them.",
	};
}

function revalidateProject(projectId: string) {
	revalidatePath(`/projects/${projectId}`, "layout");
	revalidatePath("/projects");
}

export async function bulkMoveTasks(
	projectId: string,
	taskIds: string[],
	targetStageId: string,
): Promise<BoardMutationResult> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	const taskIdsResult = taskIdsSchema.safeParse(taskIds);

	const stageIdResult = stageIdSchema.safeParse(targetStageId);

	if (
		!projectIdResult.success ||
		!taskIdsResult.success ||
		!stageIdResult.success
	) {
		return invalidBulkSelection();
	}

	try {
		const user = await getCurrentDatabaseUser();

		const result = await moveTasksForUser(
			projectIdResult.data,
			taskIdsResult.data,
			stageIdResult.data,
			user.id,
		);

		if (!result) {
			return bulkMutationFailed();
		}

		revalidateProject(result.projectId);

		return {
			success: true,
			message: `${result.affectedCount} ${
				result.affectedCount === 1 ? "task" : "tasks"
			} moved.`,
		};
	} catch (error) {
		console.error("Failed to move selected tasks:", error);

		return {
			success: false,
			message: "Something went wrong while moving the selected tasks.",
		};
	}
}

export async function bulkSetTaskPriority(
	projectId: string,
	taskIds: string[],
	priority: "low" | "medium" | "high" | "urgent" | null,
): Promise<BoardMutationResult> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	const taskIdsResult = taskIdsSchema.safeParse(taskIds);

	const priorityResult = prioritySchema.safeParse(priority);

	if (
		!projectIdResult.success ||
		!taskIdsResult.success ||
		!priorityResult.success
	) {
		return invalidBulkSelection();
	}

	try {
		const user = await getCurrentDatabaseUser();

		const result = await setTaskPriorityForUser(
			projectIdResult.data,
			taskIdsResult.data,
			priorityResult.data,
			user.id,
		);

		if (!result) {
			return bulkMutationFailed();
		}

		revalidateProject(result.projectId);

		return {
			success: true,
			message:
				result.affectedCount === 0
					? "The selected tasks already have that priority."
					: `Priority updated on ${result.affectedCount} ${
							result.affectedCount === 1 ? "task" : "tasks"
						}.`,
		};
	} catch (error) {
		console.error("Failed to update selected task priorities:", error);

		return {
			success: false,
			message: "Something went wrong while updating task priority.",
		};
	}
}

export async function bulkAssignTasks(
	projectId: string,
	taskIds: string[],
	assigneeUserId: string,
): Promise<BoardMutationResult> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	const taskIdsResult = taskIdsSchema.safeParse(taskIds);

	const userIdResult = userIdSchema.safeParse(assigneeUserId);

	if (
		!projectIdResult.success ||
		!taskIdsResult.success ||
		!userIdResult.success
	) {
		return invalidBulkSelection();
	}

	try {
		const user = await getCurrentDatabaseUser();

		const result = await assignUserToTasksForUser(
			projectIdResult.data,
			taskIdsResult.data,
			userIdResult.data,
			user.id,
		);

		if (!result) {
			return bulkMutationFailed();
		}

		revalidateProject(result.projectId);

		return {
			success: true,
			message:
				result.affectedCount === 0
					? "That person is already assigned to all selected tasks."
					: `Assignee added to ${result.affectedCount} ${
							result.affectedCount === 1 ? "task" : "tasks"
						}.`,
		};
	} catch (error) {
		console.error("Failed to assign selected tasks:", error);

		return {
			success: false,
			message: "Something went wrong while assigning the selected tasks.",
		};
	}
}

export async function bulkUnassignTasks(
	projectId: string,
	taskIds: string[],
	assigneeUserId: string,
): Promise<BoardMutationResult> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	const taskIdsResult = taskIdsSchema.safeParse(taskIds);

	const userIdResult = userIdSchema.safeParse(assigneeUserId);

	if (
		!projectIdResult.success ||
		!taskIdsResult.success ||
		!userIdResult.success
	) {
		return invalidBulkSelection();
	}

	try {
		const user = await getCurrentDatabaseUser();

		const result = await unassignUserFromTasksForUser(
			projectIdResult.data,
			taskIdsResult.data,
			userIdResult.data,
			user.id,
		);

		if (!result) {
			return bulkMutationFailed();
		}

		revalidateProject(result.projectId);

		return {
			success: true,
			message:
				result.affectedCount === 0
					? "That person is not assigned to the selected tasks."
					: `Assignee removed from ${result.affectedCount} ${
							result.affectedCount === 1 ? "task" : "tasks"
						}.`,
		};
	} catch (error) {
		console.error("Failed to unassign selected tasks:", error);

		return {
			success: false,
			message: "Something went wrong while unassigning the selected tasks.",
		};
	}
}

export async function bulkAddTaskLabel(
	projectId: string,
	taskIds: string[],
	labelId: string,
): Promise<BoardMutationResult> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	const taskIdsResult = taskIdsSchema.safeParse(taskIds);

	const labelIdResult = labelIdSchema.safeParse(labelId);

	if (
		!projectIdResult.success ||
		!taskIdsResult.success ||
		!labelIdResult.success
	) {
		return invalidBulkSelection();
	}

	try {
		const user = await getCurrentDatabaseUser();

		const result = await addLabelToTasksForUser(
			projectIdResult.data,
			taskIdsResult.data,
			labelIdResult.data,
			user.id,
		);

		if (!result) {
			return bulkMutationFailed();
		}

		revalidateProject(result.projectId);

		return {
			success: true,
			message:
				result.affectedCount === 0
					? "That label is already on all selected tasks."
					: `Label added to ${result.affectedCount} ${
							result.affectedCount === 1 ? "task" : "tasks"
						}.`,
		};
	} catch (error) {
		console.error("Failed to label selected tasks:", error);

		return {
			success: false,
			message: "Something went wrong while labeling the selected tasks.",
		};
	}
}

export async function bulkRemoveTaskLabel(
	projectId: string,
	taskIds: string[],
	labelId: string,
): Promise<BoardMutationResult> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	const taskIdsResult = taskIdsSchema.safeParse(taskIds);

	const labelIdResult = labelIdSchema.safeParse(labelId);

	if (
		!projectIdResult.success ||
		!taskIdsResult.success ||
		!labelIdResult.success
	) {
		return invalidBulkSelection();
	}

	try {
		const user = await getCurrentDatabaseUser();

		const result = await removeLabelFromTasksForUser(
			projectIdResult.data,
			taskIdsResult.data,
			labelIdResult.data,
			user.id,
		);

		if (!result) {
			return bulkMutationFailed();
		}

		revalidateProject(result.projectId);

		return {
			success: true,
			message:
				result.affectedCount === 0
					? "That label is not on the selected tasks."
					: `Label removed from ${result.affectedCount} ${
							result.affectedCount === 1 ? "task" : "tasks"
						}.`,
		};
	} catch (error) {
		console.error("Failed to remove labels from selected tasks:", error);

		return {
			success: false,
			message: "Something went wrong while removing the label.",
		};
	}
}

export async function bulkArchiveTasks(
	projectId: string,
	taskIds: string[],
): Promise<BoardMutationResult> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	const taskIdsResult = taskIdsSchema.safeParse(taskIds);

	if (!projectIdResult.success || !taskIdsResult.success) {
		return invalidBulkSelection();
	}

	try {
		const user = await getCurrentDatabaseUser();

		const result = await archiveTasksForUser(
			projectIdResult.data,
			taskIdsResult.data,
			user.id,
		);

		if (!result) {
			return bulkMutationFailed();
		}

		revalidateProject(result.projectId);

		return {
			success: true,
			message: `${result.affectedCount} ${
				result.affectedCount === 1 ? "task" : "tasks"
			} archived.`,
		};
	} catch (error) {
		console.error("Failed to archive selected tasks:", error);

		return {
			success: false,
			message: "Something went wrong while archiving the selected tasks.",
		};
	}
}
export async function bulkDeleteTasks(
	projectId: string,
	taskIds: string[],
): Promise<BoardMutationResult> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	const taskIdsResult = taskIdsSchema.safeParse(taskIds);

	if (!projectIdResult.success || !taskIdsResult.success) {
		return invalidBulkSelection();
	}

	try {
		const user = await getCurrentDatabaseUser();

		const result = await deleteTasksForUser(
			projectIdResult.data,
			taskIdsResult.data,
			user.id,
		);

		if (!result) {
			return bulkMutationFailed();
		}

		revalidateProject(result.projectId);

		return {
			success: true,
			message: `${result.affectedCount} ${
				result.affectedCount === 1 ? "task" : "tasks"
			} deleted.`,
		};
	} catch (error) {
		console.error("Failed to delete selected tasks:", error);

		return {
			success: false,
			message: "Something went wrong while deleting the selected tasks.",
		};
	}
}
