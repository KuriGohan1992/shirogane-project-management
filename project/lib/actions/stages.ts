"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	createStageInProject,
	deleteStageForUser,
	moveStageForUser,
	renameStageForUser,
	reorderStageForUser,
} from "@/lib/db/stages";
import { projectIdSchema } from "@/lib/validations/project";
import { stageFormSchema, stageIdSchema } from "@/lib/validations/stage";
import type { BoardMutationResult } from "@/types/board";
import type { StageActionState } from "@/types/stage";

export async function createStage(
	projectId: string,
	_previousState: StageActionState,
	formData: FormData,
): Promise<StageActionState> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	if (!projectIdResult.success) {
		return {
			success: false,
			message: "The selected project is invalid.",
		};
	}

	const result = stageFormSchema.safeParse({
		name: formData.get("name"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const created = await createStageInProject(projectIdResult.data, user.id, {
			name: result.data.name,
		});

		if (!created) {
			return {
				success: false,
				message: "You do not have permission to add a stage to this project.",
			};
		}

		revalidatePath(`/projects/${created.projectId}`);

		return {
			success: true,
			message: "Stage created.",
		};
	} catch (error) {
		console.error("Failed to create stage:", error);

		return {
			success: false,
			message: "Something went wrong while creating the stage.",
		};
	}
}

export async function renameStage(
	stageId: string,
	_previousState: StageActionState,
	formData: FormData,
): Promise<StageActionState> {
	const stageIdResult = stageIdSchema.safeParse(stageId);

	if (!stageIdResult.success) {
		return {
			success: false,
			message:
				"The stage could not be found or you do not have permission to edit it.",
		};
	}

	const result = stageFormSchema.safeParse({
		name: formData.get("name"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const renamed = await renameStageForUser(stageIdResult.data, user.id, {
			name: result.data.name,
		});

		if (!renamed) {
			return {
				success: false,
				message:
					"The stage could not be found or you do not have permission to edit it.",
			};
		}

		revalidatePath(`/projects/${renamed.projectId}`);

		return {
			success: true,
			message: "Stage renamed.",
		};
	} catch (error) {
		console.error("Failed to rename stage:", error);

		return {
			success: false,
			message: "Something went wrong while renaming the stage.",
		};
	}
}

export async function deleteStage(
	projectId: string,
	stageId: string,
	_formData: FormData,
): Promise<void> {
	const projectIdResult = projectIdSchema.safeParse(projectId);
	const stageIdResult = stageIdSchema.safeParse(stageId);

	if (!projectIdResult.success || !stageIdResult.success) {
		throw new Error(
			"The stage could not be found or you do not have permission to delete it.",
		);
	}

	const user = await getCurrentDatabaseUser();

	const result = await deleteStageForUser(
		projectIdResult.data,
		stageIdResult.data,
		user.id,
	);

	if (result.status === "forbidden") {
		throw new Error(
			"The stage could not be found or you do not have permission to delete it.",
		);
	}

	revalidatePath(`/projects/${result.projectId}`);
}

export async function moveStage(
	stageId: string,
	direction: "left" | "right",
	_formData: FormData,
): Promise<void> {
	const stageIdResult = stageIdSchema.safeParse(stageId);

	if (!stageIdResult.success) {
		throw new Error(
			"The stage could not be found or you do not have permission to move it.",
		);
	}

	if (direction !== "left" && direction !== "right") {
		throw new Error("Invalid stage move direction.");
	}

	const user = await getCurrentDatabaseUser();

	const projectId = await moveStageForUser(
		stageIdResult.data,
		user.id,
		direction,
	);
	if (!projectId) {
		throw new Error(
			"The stage could not be found or you do not have permission to move it.",
		);
	}

	revalidatePath(`/projects/${projectId}`);
}
export async function reorderStage(
	stageId: string,
	targetIndex: number,
): Promise<BoardMutationResult> {
	const stageIdResult = stageIdSchema.safeParse(stageId);

	const targetIndexResult = z
		.number()
		.int()
		.nonnegative()
		.safeParse(targetIndex);

	if (!stageIdResult.success || !targetIndexResult.success) {
		return {
			success: false,
			message: "The requested stage movement is invalid.",
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const projectId = await reorderStageForUser(
			stageIdResult.data,
			user.id,
			targetIndexResult.data,
		);

		if (!projectId) {
			return {
				success: false,
				message: "You do not have permission to reorder this stage.",
			};
		}

		revalidatePath(`/projects/${projectId}`);

		return {
			success: true,
		};
	} catch (error) {
		console.error("Failed to reorder stage:", error);

		return {
			success: false,
			message: "Something went wrong while reordering the stage.",
		};
	}
}
