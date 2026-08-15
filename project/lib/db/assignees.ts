import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { taskAssignees } from "@/lib/db/schema";

type AssignTaskResult =
	| {
			status: "task_not_found";
	  }
	| {
			status: "assigned" | "already_assigned" | "assignee_not_project_member";
			projectId: string;
	  };

type UnassignTaskResult =
	| {
			status: "task_not_found";
	  }
	| {
			status: "unassigned" | "not_assigned";
			projectId: string;
	  };

async function getOwnedTask(taskId: string, ownerId: string) {
	const task = await db.query.tasks.findFirst({
		columns: {
			id: true,
		},

		where: (task, { eq }) => eq(task.id, taskId),

		with: {
			stage: {
				columns: {
					id: true,
				},

				with: {
					project: {
						columns: {
							id: true,
							ownerId: true,
						},
					},
				},
			},
		},
	});

	if (!task || task.stage.project.ownerId !== ownerId) {
		return undefined;
	}

	return task;
}

async function isAssignableProjectUser(
	projectId: string,
	projectOwnerId: string,
	userId: string,
) {
	if (userId === projectOwnerId) {
		return true;
	}

	const member = await db.query.projectMembers.findFirst({
		columns: {
			userId: true,
		},

		where: (member, { and, eq }) =>
			and(
				eq(member.projectId, projectId),
				eq(member.userId, userId),
				eq(member.role, "member"),
			),
	});

	return Boolean(member);
}

export async function assignUserToOwnedTask(
	taskId: string,
	assigneeUserId: string,
	ownerId: string,
): Promise<AssignTaskResult> {
	const task = await getOwnedTask(taskId, ownerId);

	if (!task) {
		return {
			status: "task_not_found",
		};
	}

	const projectId = task.stage.project.id;

	const canBeAssigned = await isAssignableProjectUser(
		projectId,
		ownerId,
		assigneeUserId,
	);

	if (!canBeAssigned) {
		return {
			status: "assignee_not_project_member",
			projectId,
		};
	}

	const [assignment] = await db
		.insert(taskAssignees)
		.values({
			taskId,
			userId: assigneeUserId,
		})
		.onConflictDoNothing()
		.returning({
			userId: taskAssignees.userId,
		});

	return {
		status: assignment ? "assigned" : "already_assigned",
		projectId,
	};
}

export async function unassignUserFromOwnedTask(
	taskId: string,
	assigneeUserId: string,
	ownerId: string,
): Promise<UnassignTaskResult> {
	const task = await getOwnedTask(taskId, ownerId);

	if (!task) {
		return {
			status: "task_not_found",
		};
	}

	const [assignment] = await db
		.delete(taskAssignees)
		.where(
			and(
				eq(taskAssignees.taskId, taskId),
				eq(taskAssignees.userId, assigneeUserId),
			),
		)
		.returning({
			userId: taskAssignees.userId,
		});

	return {
		status: assignment ? "unassigned" : "not_assigned",
		projectId: task.stage.project.id,
	};
}
