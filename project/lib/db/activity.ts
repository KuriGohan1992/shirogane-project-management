import "server-only";

import type {
	TaskActivityAction,
	TaskActivityMetadata,
} from "@/lib/constants/activity";
import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";

type RecordTaskActivityInput = {
	projectId: string;
	taskId: string | null;
	actorId: string;
	action: TaskActivityAction;
	taskTitle: string;
	metadata?: Omit<TaskActivityMetadata, "taskTitle">;
};

export async function recordTaskActivity({
	projectId,
	taskId,
	actorId,
	action,
	taskTitle,
	metadata,
}: RecordTaskActivityInput) {
	try {
		await db.insert(activityLogs).values({
			projectId,
			taskId,
			actorId,
			action,
			metadata: {
				taskTitle,
				...metadata,
			},
		});
	} catch (error) {
		console.error("Failed to record task activity:", error);
	}
}
