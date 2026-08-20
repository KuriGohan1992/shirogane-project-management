"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import {
	createCommentForTask,
	deleteCommentForUser,
	updateCommentForUser,
} from "@/lib/db/comments";
import { commentFormSchema, commentIdSchema } from "@/lib/validations/comment";
import { taskIdSchema } from "@/lib/validations/task";
import type { CommentActionState } from "@/types/comment";

export async function createComment(
	taskId: string,
	_previousState: CommentActionState,
	formData: FormData,
): Promise<CommentActionState> {
	const taskIdResult = taskIdSchema.safeParse(taskId);

	if (!taskIdResult.success) {
		return {
			success: false,
			message: "The selected task is invalid.",
		};
	}

	const result = commentFormSchema.safeParse({
		content: formData.get("content"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const created = await createCommentForTask(
			taskIdResult.data,
			user.id,
			result.data.content,
		);

		if (!created) {
			return {
				success: false,
				message: "You do not have permission to comment on this task.",
			};
		}

		revalidatePath(`/projects/${created.projectId}`, "layout");
		revalidatePath("/projects");

		return {
			success: true,
			message: "Comment added.",
		};
	} catch (error) {
		console.error("Failed to create comment:", error);

		return {
			success: false,
			message: "Something went wrong while adding the comment.",
		};
	}
}

export async function updateComment(
	commentId: string,
	_previousState: CommentActionState,
	formData: FormData,
): Promise<CommentActionState> {
	const commentIdResult = commentIdSchema.safeParse(commentId);

	if (!commentIdResult.success) {
		return {
			success: false,
			message:
				"The comment could not be found or you do not have permission to edit it.",
		};
	}

	const result = commentFormSchema.safeParse({
		content: formData.get("content"),
	});

	if (!result.success) {
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const updated = await updateCommentForUser(
			commentIdResult.data,
			user.id,
			result.data.content,
		);

		if (!updated) {
			return {
				success: false,
				message:
					"The comment could not be found or you do not have permission to edit it.",
			};
		}

		revalidatePath(`/projects/${updated.projectId}`, "layout");

		return {
			success: true,
			message: "Comment updated.",
		};
	} catch (error) {
		console.error("Failed to update comment:", error);

		return {
			success: false,
			message: "Something went wrong while updating the comment.",
		};
	}
}

export async function deleteComment(
	commentId: string,
	_previousState: CommentActionState,
	_formData: FormData,
): Promise<CommentActionState> {
	const commentIdResult = commentIdSchema.safeParse(commentId);

	if (!commentIdResult.success) {
		return {
			success: false,
			message: "The selected comment is invalid.",
		};
	}

	try {
		const user = await getCurrentDatabaseUser();

		const projectId = await deleteCommentForUser(commentIdResult.data, user.id);

		if (!projectId) {
			return {
				success: false,
				message:
					"The comment could not be found or you do not have permission to delete it.",
			};
		}

		revalidatePath(`/projects/${projectId}`, "layout");

		return {
			success: true,
			message: "Comment deleted.",
		};
	} catch (error) {
		console.error("Failed to delete comment:", error);

		return {
			success: false,
			message: "Something went wrong while deleting the comment.",
		};
	}
}
