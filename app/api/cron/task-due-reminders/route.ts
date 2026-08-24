import { NextResponse } from "next/server";

import type { AnyCreateNotificationInput } from "@/lib/constants/notifications";
import { getTaskAssignmentsDueBetween } from "@/lib/db/notifications";
import { createNotificationsSafely } from "@/lib/services/notifications";

export async function GET(request: Request) {
	const secret = process.env.CRON_SECRET;

	if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
		return new NextResponse("Unauthorized", {
			status: 401,
		});
	}

	const now = new Date();

	/*
	 * Task dates in Shiro are currently treated as
	 * date-only UTC values, so reminders operate on
	 * the current UTC calendar day as well.
	 */
	const start = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);

	const end = new Date(start);

	end.setUTCDate(end.getUTCDate() + 1);

	const assignments = await getTaskAssignmentsDueBetween(start, end);

	const inputs: AnyCreateNotificationInput[] = assignments.flatMap(
		(assignment) => {
			if (!assignment.dueDate) {
				return [];
			}

			return [
				{
					type: "task_due_soon",

					recipientId: assignment.recipientId,

					projectId: assignment.projectId,

					taskId: assignment.taskId,

					dedupeKey: `task-due-soon:${assignment.taskId}:${assignment.dueDate.toISOString()}`,

					metadata: {
						projectName: assignment.projectName,

						taskTitle: assignment.taskTitle,

						dueDate: assignment.dueDate.toISOString(),
					},
				},
			];
		},
	);

	const created = await createNotificationsSafely(inputs);

	return NextResponse.json({
		checked: assignments.length,

		created: created.length,
	});
}
