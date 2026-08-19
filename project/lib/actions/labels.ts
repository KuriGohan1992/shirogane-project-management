"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	assignLabelToTask,
	createProjectLabelForTask,
	deleteProjectLabelForUser,
	unassignLabelFromTask,
	updateProjectLabelForUser,
} from "@/lib/db/labels";
import { labelFormSchema, labelIdSchema } from "@/lib/validations/label";
import { taskIdSchema } from "@/lib/validations/task";
import type { LabelActionState } from "@/types/label";

export async function createTaskLabel(
	taskId: string,
	_previousState: LabelActionState,
	formData: FormData,
): Promise<LabelActionState> {
	const taskIdResult = taskIdSchema.safeParse(taskId);

	if (!taskIdResult.success) {
		return {
			success: false,
			message: "The selected task is invalid.",
		};
	}

	const result = labelFormSchema.safeParse({
		name: formData.get("name"),
		color: formData.get("color"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();
		const mutation = await createProjectLabelForTask(
			taskIdResult.data,
			user.id,
			result.data,
		);

		if (mutation.status === "task_not_found") {
			return {
				success: false,
				message:
					"The task could not be found or you do not have permission to edit it.",
			};
		}

		revalidatePath(`/projects/${mutation.projectId}`, "layout");

		return {
			success: true,
			message:
				mutation.status === "existing"
					? "Existing label added to the task."
					: "Label created and added to the task.",
		};
	} catch (error) {
		console.error("Failed to create task label:", error);

		return {
			success: false,
			message: "Something went wrong while creating the label.",
		};
	}
}

export async function updateProjectLabel(
	labelId: string,
	_previousState: LabelActionState,
	formData: FormData,
): Promise<LabelActionState> {
	const labelIdResult = labelIdSchema.safeParse(labelId);

	if (!labelIdResult.success) {
		return {
			success: false,
			message: "The selected label is invalid.",
		};
	}

	const result = labelFormSchema.safeParse({
		name: formData.get("name"),
		color: formData.get("color"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();
		const mutation = await updateProjectLabelForUser(
			labelIdResult.data,
			user.id,
			result.data,
		);

		if (mutation.status === "label_not_found") {
			return {
				success: false,
				message:
					"The label could not be found or you do not have permission to edit it.",
			};
		}

		if (mutation.status === "duplicate") {
			return {
				success: false,
				errors: {
					name: ["A label with that name already exists in this project."],
				},
			};
		}

		revalidatePath(`/projects/${mutation.projectId}`, "layout");

		return {
			success: true,
			message: "Label updated.",
		};
	} catch (error) {
		console.error("Failed to update project label:", error);

		return {
			success: false,
			message: "Something went wrong while updating the label.",
		};
	}
}

export async function deleteProjectLabel(
	labelId: string,
	_formData: FormData,
): Promise<void> {
	const labelIdResult = labelIdSchema.safeParse(labelId);

	if (!labelIdResult.success) {
		throw new Error("The selected label is invalid.");
	}

	const user = await getCurrentDatabaseUser();
	const mutation = await deleteProjectLabelForUser(labelIdResult.data, user.id);

	if (mutation.status !== "deleted") {
		throw new Error(
			"The label could not be found or you do not have permission to delete it.",
		);
	}

	revalidatePath(`/projects/${mutation.projectId}`, "layout");
}

export async function assignTaskLabel(
	taskId: string,
	labelId: string,
	_formData: FormData,
): Promise<void> {
	const taskIdResult = taskIdSchema.safeParse(taskId);
	const labelIdResult = labelIdSchema.safeParse(labelId);

	if (!taskIdResult.success || !labelIdResult.success) {
		throw new Error("The task or label is invalid.");
	}

	const user = await getCurrentDatabaseUser();
	const mutation = await assignLabelToTask(
		taskIdResult.data,
		labelIdResult.data,
		user.id,
	);

	if (mutation.status === "task_not_found") {
		throw new Error(
			"The task could not be found or you do not have permission to edit it.",
		);
	}

	if (mutation.status === "label_not_found") {
		throw new Error("That label does not belong to this project.");
	}

	revalidatePath(`/projects/${mutation.projectId}`, "layout");
}

export async function unassignTaskLabel(
	taskId: string,
	labelId: string,
	_formData: FormData,
): Promise<void> {
	const taskIdResult = taskIdSchema.safeParse(taskId);
	const labelIdResult = labelIdSchema.safeParse(labelId);

	if (!taskIdResult.success || !labelIdResult.success) {
		throw new Error("The task or label is invalid.");
	}

	const user = await getCurrentDatabaseUser();
	const mutation = await unassignLabelFromTask(
		taskIdResult.data,
		labelIdResult.data,
		user.id,
	);

	if (mutation.status === "task_not_found") {
		throw new Error(
			"The task could not be found or you do not have permission to edit it.",
		);
	}

	if (mutation.status === "label_not_found") {
		throw new Error("That label does not belong to this project.");
	}

	revalidatePath(`/projects/${mutation.projectId}`, "layout");
}
