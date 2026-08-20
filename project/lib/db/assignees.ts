import "server-only";

import { and, eq } from "drizzle-orm";

import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { recordTaskActivity } from "@/lib/db/activity";
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

async function getAssignableProjectUser(
	projectId: string,
	projectOwnerId: string,
	userId: string,
) {
	const user = await db.query.users.findFirst({
		columns: {
			id: true,
			name: true,
			email: true,
		},

		where: (candidate, { eq }) => eq(candidate.id, userId),
	});

	if (!user) {
		return undefined;
	}

	if (user.id === projectOwnerId) {
		return user;
	}

	const member = await db.query.projectMembers.findFirst({
		columns: {
			userId: true,
		},

		where: (member, { and, eq }) =>
			and(
				eq(member.projectId, projectId),
				eq(member.userId, user.id),
				eq(member.role, "member"),
			),
	});

	return member ? user : undefined;
}

function getUserDisplayName(user: { name: string | null; email: string }) {
	return user.name ?? user.email;
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

	const project = task.stage.project;

	const assignee = await getAssignableProjectUser(
		project.id,
		project.ownerId,
		assigneeUserId,
	);

	if (!assignee) {
		return {
			status: "assignee_not_project_member",
			projectId: project.id,
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

	if (assignment) {
		await recordTaskActivity({
			projectId: project.id,
			taskId: task.id,
			actorId: userId,
			action: "assignee_added",
			taskTitle: task.title,
			metadata: {
				assigneeName: getUserDisplayName(assignee),
			},
		});
	}

	return {
		status: assignment ? "assigned" : "already_assigned",
		projectId: project.id,
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

	const assignee = await db.query.users.findFirst({
		columns: {
			name: true,
			email: true,
		},

		where: (candidate, { eq }) => eq(candidate.id, assigneeUserId),
	});

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

	if (assignment) {
		await recordTaskActivity({
			projectId: task.stage.project.id,
			taskId: task.id,
			actorId: userId,
			action: "assignee_removed",
			taskTitle: task.title,
			metadata: {
				assigneeName: assignee
					? getUserDisplayName(assignee)
					: "a project member",
			},
		});
	}

	return {
		status: assignment ? "unassigned" : "not_assigned",
		projectId: task.stage.project.id,
	};
}
