import "server-only";

import { desc, inArray } from "drizzle-orm";

import type {
	ActivityAction,
	ActivityMetadata,
	TaskActivityAction,
	TaskActivityMetadata,
} from "@/lib/constants/activity";
import { db } from "@/lib/db";
import { getProjectAccess } from "@/lib/db/project-access";
import { activityLogs } from "@/lib/db/schema";

const PROJECT_ACTIVITY_LIMIT = 100;

type RecordActivityInput = {
	projectId: string;
	taskId?: string | null;
	actorId: string;
	action: ActivityAction;
	metadata?: ActivityMetadata;
};

type RecordTaskActivityInput = {
	projectId: string;
	taskId: string | null;
	actorId: string;
	action: TaskActivityAction;
	taskTitle: string;
	metadata?: Omit<TaskActivityMetadata, "taskTitle">;
};

export async function recordActivity({
	projectId,
	taskId = null,
	actorId,
	action,
	metadata = {},
}: RecordActivityInput) {
	try {
		await db.insert(activityLogs).values({
			projectId,
			taskId,
			actorId,
			action,
			metadata,
		});
	} catch (error) {
		console.error("Failed to record activity:", error);
	}
}

export async function recordTaskActivity({
	projectId,
	taskId,
	actorId,
	action,
	taskTitle,
	metadata,
}: RecordTaskActivityInput) {
	await recordActivity({
		projectId,
		taskId,
		actorId,
		action,
		metadata: {
			taskTitle,
			...metadata,
		},
	});
}

export async function getProjectActivityForUser(
	projectId: string,
	userId: string,
) {
	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole) {
		return undefined;
	}

	return db.query.activityLogs.findMany({
		where: (activity, { eq }) => eq(activity.projectId, projectId),

		orderBy: (activity, { desc }) => [desc(activity.createdAt)],

		limit: PROJECT_ACTIVITY_LIMIT,

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

export async function getLatestProjectActivityDate(projectId: string) {
	const activity = await db.query.activityLogs.findFirst({
		columns: {
			createdAt: true,
		},

		where: (activity, { eq }) => eq(activity.projectId, projectId),

		orderBy: (activity, { desc }) => [desc(activity.createdAt)],
	});

	return activity?.createdAt;
}

export async function getLatestProjectActivityDates(projectIds: string[]) {
	if (projectIds.length === 0) {
		return [];
	}

	return db
		.selectDistinctOn([activityLogs.projectId], {
			projectId: activityLogs.projectId,
			createdAt: activityLogs.createdAt,
		})
		.from(activityLogs)
		.where(inArray(activityLogs.projectId, projectIds))
		.orderBy(activityLogs.projectId, desc(activityLogs.createdAt));
}
