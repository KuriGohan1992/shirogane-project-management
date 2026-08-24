"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	archiveTaskForUser,
	deleteAllArchivedTasksForUser,
	deleteArchivedTaskForUser,
	restoreAllArchivedTasksForUser,
	restoreArchivedTaskForUser,
} from "@/lib/db/task-archive";
import { projectIdSchema } from "@/lib/validations/project";
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

	revalidatePath("/projects");
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
	revalidatePath("/projects");
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
	revalidatePath("/projects");
}

export async function restoreAllArchivedTasks(
	projectId: string,
	_formData: FormData,
): Promise<void> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	if (!projectIdResult.success) {
		throw new Error("The selected project is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	const restoredCount = await restoreAllArchivedTasksForUser(
		projectIdResult.data,
		user.id,
	);

	if (restoredCount === undefined) {
		throw new Error(
			"The project could not be found or you do not have permission to restore its tasks.",
		);
	}

	revalidatePath(`/projects/${projectIdResult.data}`, "layout");
	revalidatePath("/projects");
	revalidatePath("/dashboard");
	revalidatePath("/calendar");
}

export async function deleteAllArchivedTasks(
	projectId: string,
	_formData: FormData,
): Promise<void> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	if (!projectIdResult.success) {
		throw new Error("The selected project is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	const deletedCount = await deleteAllArchivedTasksForUser(
		projectIdResult.data,
		user.id,
	);

	if (deletedCount === undefined) {
		throw new Error(
			"The project could not be found or you do not have permission to delete its archived tasks.",
		);
	}

	revalidatePath(`/projects/${projectIdResult.data}`, "layout");
	revalidatePath("/projects");
	revalidatePath("/dashboard");
	revalidatePath("/calendar");
}
