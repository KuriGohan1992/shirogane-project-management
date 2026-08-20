"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	archiveTaskForUser,
	deleteArchivedTaskForUser,
	restoreArchivedTaskForUser,
} from "@/lib/db/task-archive";
import { taskIdSchema } from "@/lib/validations/task";

export async function archiveTask(
	taskId: string,
	redirectToProject: boolean,
	_formData: FormData,
): Promise<void> {
	const taskIdResult = taskIdSchema.safeParse(taskId);

	if (!taskIdResult.success) {
		throw new Error("The selected task is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	const projectId = await archiveTaskForUser(taskIdResult.data, user.id);

	if (!projectId) {
		throw new Error(
			"The task could not be found or you do not have permission to archive it.",
		);
	}

	revalidatePath(`/projects/${projectId}`, "layout");

	if (redirectToProject) {
		redirect(`/projects/${projectId}`);
	}
}

export async function restoreArchivedTask(
	taskId: string,
	_formData: FormData,
): Promise<void> {
	const taskIdResult = taskIdSchema.safeParse(taskId);

	if (!taskIdResult.success) {
		throw new Error("The selected task is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	const projectId = await restoreArchivedTaskForUser(
		taskIdResult.data,
		user.id,
	);

	if (!projectId) {
		throw new Error(
			"The task could not be found or you do not have permission to restore it.",
		);
	}

	revalidatePath(`/projects/${projectId}`, "layout");
}

export async function deleteArchivedTask(
	taskId: string,
	_formData: FormData,
): Promise<void> {
	const taskIdResult = taskIdSchema.safeParse(taskId);

	if (!taskIdResult.success) {
		throw new Error("The selected task is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	const projectId = await deleteArchivedTaskForUser(taskIdResult.data, user.id);

	if (!projectId) {
		throw new Error(
			"The task could not be found or you do not have permission to permanently delete it.",
		);
	}

	revalidatePath(`/projects/${projectId}`, "layout");
}
