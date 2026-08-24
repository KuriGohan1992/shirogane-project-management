import "server-only";

import { eq } from "drizzle-orm";

import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { recordTaskActivity } from "@/lib/db/activity";
import { getProjectAccess } from "@/lib/db/project-access";
import type { TaskComment } from "@/lib/db/schema";
import { taskComments } from "@/lib/db/schema";
import { createNotificationsSafely } from "../services/notifications";
import { getTaskAssigneeUserIds } from "./notifications";

type CommentMutationResult = {
	comment: TaskComment;
	projectId: string;
};

async function getCommentableTask(taskId: string, userId: string) {
	const task = await db.query.tasks.findFirst({
		columns: {
			id: true,
			title: true,
		},

		where: (task, { and, eq, isNull }) =>
			and(eq(task.id, taskId), isNull(task.archivedAt)),

		with: {
			stage: {
				columns: {
					projectId: true,
				},

				with: {
					project: {
						columns: {
							id: true,
							name: true,
						},
					},
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

async function getCommentContext(commentId: string) {
	return db.query.taskComments.findFirst({
		columns: {
			id: true,
			authorId: true,
		},

		where: (comment, { eq }) => eq(comment.id, commentId),

		with: {
			task: {
				columns: {
					archivedAt: true,
				},

				with: {
					stage: {
						columns: {
							projectId: true,
						},
					},
				},
			},
		},
	});
}

export async function createCommentForTask(
	taskId: string,
	userId: string,
	content: string,
): Promise<CommentMutationResult | undefined> {
	const task = await getCommentableTask(taskId, userId);

	if (!task) {
		return undefined;
	}

	const [comment] = await db
		.insert(taskComments)
		.values({
			taskId,
			authorId: userId,
			content,
		})
		.returning();

	if (!comment) {
		throw new Error("Failed to create comment.");
	}

	await recordTaskActivity({
		projectId: task.stage.projectId,
		taskId: task.id,
		actorId: userId,
		action: "comment_added",
		taskTitle: task.title,
	});

	const assigneeUserIds = await getTaskAssigneeUserIds(task.id);

	await createNotificationsSafely(
		assigneeUserIds.map((recipientId) => ({
			type: "task_comment_added" as const,

			recipientId,

			actorId: userId,

			projectId: task.stage.projectId,

			taskId: task.id,

			dedupeKey: `task-comment:${comment.id}`,

			metadata: {
				projectName: task.stage.project.name,

				taskTitle: task.title,
			},
		})),
	);

	return {
		comment,
		projectId: task.stage.projectId,
	};
}

export async function updateCommentForUser(
	commentId: string,
	userId: string,
	content: string,
): Promise<CommentMutationResult | undefined> {
	const comment = await getCommentContext(commentId);

	if (!comment || comment.task.archivedAt || comment.authorId !== userId) {
		return undefined;
	}

	const projectId = comment.task.stage.projectId;

	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canManageTasks) {
		return undefined;
	}

	const [updatedComment] = await db
		.update(taskComments)
		.set({
			content,
			updatedAt: new Date(),
		})
		.where(eq(taskComments.id, commentId))
		.returning();

	if (!updatedComment) {
		return undefined;
	}

	return {
		comment: updatedComment,
		projectId,
	};
}

export async function deleteCommentForUser(
	commentId: string,
	userId: string,
): Promise<string | undefined> {
	const comment = await getCommentContext(commentId);

	if (!comment || comment.task.archivedAt) {
		return undefined;
	}

	const projectId = comment.task.stage.projectId;

	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole) {
		return undefined;
	}

	const permissions = getProjectPermissions(accessRole);

	const canDelete =
		accessRole === "owner" ||
		(permissions.canManageTasks && comment.authorId === userId);

	if (!canDelete) {
		return undefined;
	}

	const [deletedComment] = await db
		.delete(taskComments)
		.where(eq(taskComments.id, commentId))
		.returning({
			id: taskComments.id,
		});

	return deletedComment ? projectId : undefined;
}
