"use server";

import { revalidatePath } from "next/cache";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { assignUserToTask, unassignUserFromTask } from "@/lib/db/assignees";
import { taskIdSchema } from "@/lib/validations/task";
import { userIdSchema } from "@/lib/validations/user";

export async function assignTask(
	taskId: string,
	assigneeUserId: string,
	_formData: FormData,
): Promise<void> {
	const taskIdResult = taskIdSchema.safeParse(taskId);

	const userIdResult = userIdSchema.safeParse(assigneeUserId);

	if (!taskIdResult.success || !userIdResult.success) {
		throw new Error("The task or assignee is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	const result = await assignUserToTask(
		taskIdResult.data,
		userIdResult.data,
		user.id,
	);

	if (result.status === "task_not_found") {
		throw new Error(
			"The task could not be found or you do not have permission to edit it.",
		);
	}

	if (result.status === "assignee_not_project_member") {
		throw new Error("Only project members can be assigned to this task.");
	}

	revalidatePath(`/projects/${result.projectId}`);
}

export async function unassignTask(
	taskId: string,
	assigneeUserId: string,
	_formData: FormData,
): Promise<void> {
	const taskIdResult = taskIdSchema.safeParse(taskId);

	const userIdResult = userIdSchema.safeParse(assigneeUserId);

	if (!taskIdResult.success || !userIdResult.success) {
		throw new Error("The task or assignee is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	const result = await unassignUserFromTask(
		taskIdResult.data,
		userIdResult.data,
		user.id,
	);

	if (result.status === "task_not_found") {
		throw new Error(
			"The task could not be found or you do not have permission to edit it.",
		);
	}

	revalidatePath(`/projects/${result.projectId}`);
}
