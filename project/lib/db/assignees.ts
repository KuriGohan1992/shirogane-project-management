import "server-only";

import { and, eq } from "drizzle-orm";
import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { getProjectAccess } from "@/lib/db/project-access";
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

async function getAssignableTask(taskId: string, userId: string) {
	const task = await db.query.tasks.findFirst({
		columns: {
			id: true,
		},

		where: (task, { eq }) => eq(task.id, taskId),

		with: {
			stage: {
				columns: {
					projectId: true,
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

	if (!task) {
		return undefined;
	}

	const project = task.stage.project;

	const accessRole = await getProjectAccess(project.id, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canAssignTasks) {
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

export async function assignUserToTask(
	taskId: string,
	assigneeUserId: string,
	userId: string,
): Promise<AssignTaskResult> {
	const task = await getAssignableTask(taskId, userId);

	if (!task) {
		return {
			status: "task_not_found",
		};
	}

	const projectId = task.stage.project.id;

	const canBeAssigned = await isAssignableProjectUser(
		projectId,
		userId,
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

export async function unassignUserFromTask(
	taskId: string,
	assigneeUserId: string,
	userId: string,
): Promise<UnassignTaskResult> {
	const task = await getAssignableTask(taskId, userId);

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
