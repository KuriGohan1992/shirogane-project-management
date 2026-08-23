import "server-only";

import { and, count, eq, gte, isNull, lt } from "drizzle-orm";

import type { AnyCreateNotificationInput } from "@/lib/constants/notifications";
import { db } from "@/lib/db";
import {
	notifications,
	projects,
	stages,
	taskAssignees,
	tasks,
} from "@/lib/db/schema";
import type {
	NotificationCenterData,
	NotificationItem,
} from "@/types/notification";

export function getNotificationsForUser(recipientId: string, limit = 30) {
	return db.query.notifications.findMany({
		where: (notification, { eq }) => eq(notification.recipientId, recipientId),

		orderBy: (notification, { desc }) => [desc(notification.createdAt)],

		limit,

		with: {
			actor: {
				columns: {
					id: true,
					name: true,
					email: true,
					imageUrl: true,
				},
			},
		},
	});
}

export async function getUnreadNotificationCount(recipientId: string) {
	const [row] = await db
		.select({
			total: count(),
		})
		.from(notifications)
		.where(
			and(
				eq(notifications.recipientId, recipientId),
				isNull(notifications.readAt),
			),
		);

	return row?.total ?? 0;
}

export async function getNotificationCenterDataForUser(
	recipientId: string,
	limit = 30,
): Promise<NotificationCenterData> {
	const [rows, unreadCount] = await Promise.all([
		getNotificationsForUser(recipientId, limit),

		getUnreadNotificationCount(recipientId),
	]);

	const items = rows.map(
		(notification) =>
			({
				id: notification.id,
				type: notification.type,

				actor: notification.actor ?? null,

				projectId: notification.projectId,

				taskId: notification.taskId,

				metadata: notification.metadata,

				readAt: notification.readAt?.toISOString() ?? null,

				createdAt: notification.createdAt.toISOString(),
			}) as NotificationItem,
	);

	return {
		items,
		unreadCount,
	};
}

export async function createNotificationRecords(
	inputs: AnyCreateNotificationInput[],
) {
	if (inputs.length === 0) {
		return [];
	}

	return db
		.insert(notifications)
		.values(
			inputs.map((input) => ({
				recipientId: input.recipientId,

				actorId: input.actorId ?? null,

				projectId: input.projectId ?? null,

				taskId: input.taskId ?? null,

				type: input.type,

				metadata: input.metadata,

				dedupeKey: input.dedupeKey ?? null,
			})),
		)
		.onConflictDoNothing()
		.returning();
}

export async function markNotificationReadForUser(
	notificationId: string,
	recipientId: string,
) {
	const [notification] = await db
		.update(notifications)
		.set({
			readAt: new Date(),
		})
		.where(
			and(
				eq(notifications.id, notificationId),
				eq(notifications.recipientId, recipientId),
				isNull(notifications.readAt),
			),
		)
		.returning({
			id: notifications.id,
		});

	return notification;
}

export async function markAllNotificationsReadForUser(recipientId: string) {
	return db
		.update(notifications)
		.set({
			readAt: new Date(),
		})
		.where(
			and(
				eq(notifications.recipientId, recipientId),
				isNull(notifications.readAt),
			),
		)
		.returning({
			id: notifications.id,
		});
}

export async function getTaskAssigneeUserIds(taskId: string) {
	const rows = await db
		.select({
			userId: taskAssignees.userId,
		})
		.from(taskAssignees)
		.where(eq(taskAssignees.taskId, taskId));

	return rows.map((row) => row.userId);
}

/*
 * Useful when querying one user's upcoming work.
 */
export async function getAssignedTasksDueBetween(
	userId: string,
	start: Date,
	end: Date,
) {
	return db
		.select({
			taskId: tasks.id,
			taskTitle: tasks.title,
			dueDate: tasks.dueDate,

			projectId: projects.id,
			projectName: projects.name,
		})
		.from(taskAssignees)
		.innerJoin(tasks, eq(taskAssignees.taskId, tasks.id))
		.innerJoin(stages, eq(tasks.stageId, stages.id))
		.innerJoin(projects, eq(stages.projectId, projects.id))
		.where(
			and(
				eq(taskAssignees.userId, userId),
				isNull(tasks.archivedAt),
				isNull(projects.completedAt),
				gte(tasks.dueDate, start),
				lt(tasks.dueDate, end),
			),
		);
}

/*
 * Used by the scheduled reminder job.
 *
 * Unlike getAssignedTasksDueBetween(), this returns
 * every affected recipient so one cron execution can
 * generate reminders for everybody.
 */
export async function getTaskAssignmentsDueBetween(start: Date, end: Date) {
	return db
		.select({
			recipientId: taskAssignees.userId,

			taskId: tasks.id,

			taskTitle: tasks.title,

			dueDate: tasks.dueDate,

			projectId: projects.id,

			projectName: projects.name,
		})
		.from(taskAssignees)
		.innerJoin(tasks, eq(taskAssignees.taskId, tasks.id))
		.innerJoin(stages, eq(tasks.stageId, stages.id))
		.innerJoin(projects, eq(stages.projectId, projects.id))
		.where(
			and(
				isNull(tasks.archivedAt),
				isNull(projects.completedAt),
				gte(tasks.dueDate, start),
				lt(tasks.dueDate, end),
			),
		);
}
