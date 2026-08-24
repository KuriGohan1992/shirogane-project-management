import "server-only";

import { and, eq } from "drizzle-orm";

import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { recordTaskActivity } from "@/lib/db/activity";
import { addProjectMemberByUserIdOwnedByUser } from "@/lib/db/members";
import { getProjectAccess } from "@/lib/db/project-access";
import { taskAssignees } from "@/lib/db/schema";
import { getTeamCollaboratorProfilesForUser } from "@/lib/db/team";
import { createNotificationsSafely } from "../services/notifications";

type AssignTaskResult =
	| {
			status: "task_not_found";
	  }
	| {
			status: "assigned" | "already_assigned" | "assignee_not_assignable";
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

	const project = task.stage.project;

	const accessRole = await getProjectAccess(project.id, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canAssignTasks) {
		return undefined;
	}

	return task;
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

	const assignable = await ensureAssignableProjectUsers(
		project.id,
		[assigneeUserId],
		userId,
	);

	const assignee = assignable?.users[0];

	if (!assignee) {
		return {
			status: "assignee_not_assignable",
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

		await createNotificationsSafely([
			{
				type: "task_assigned",

				recipientId: assigneeUserId,

				actorId: userId,

				projectId: project.id,

				taskId: task.id,

				metadata: {
					projectName: project.name,

					taskTitle: task.title,
				},
			},
		]);
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
					: "a project collaborator",
			},
		});

		await createNotificationsSafely([
			{
				type: "task_unassigned",

				recipientId: assigneeUserId,

				actorId: userId,

				projectId: task.stage.project.id,

				taskId: task.id,

				metadata: {
					projectName: task.stage.project.name,

					taskTitle: task.title,
				},
			},
		]);
	}

	return {
		status: assignment ? "unassigned" : "not_assigned",
		projectId: task.stage.project.id,
	};
}

export async function ensureAssignableProjectUsers(
	projectId: string,
	assigneeUserIds: string[],
	actorId: string,
) {
	const uniqueUserIds = [...new Set(assigneeUserIds)];

	if (uniqueUserIds.length === 0) {
		return undefined;
	}

	const accessRole = await getProjectAccess(projectId, actorId);

	if (!accessRole || !getProjectPermissions(accessRole).canAssignTasks) {
		return undefined;
	}

	const [project, users, memberships] = await Promise.all([
		db.query.projects.findFirst({
			columns: {
				id: true,
				ownerId: true,
				name: true,
			},

			where: (project, { eq }) => eq(project.id, projectId),
		}),

		db.query.users.findMany({
			columns: {
				id: true,
				name: true,
				email: true,
			},

			where: (user, { inArray }) => inArray(user.id, uniqueUserIds),
		}),

		db.query.projectMembers.findMany({
			columns: {
				userId: true,
				role: true,
			},

			where: (member, { and, eq, inArray }) =>
				and(
					eq(member.projectId, projectId),
					inArray(member.userId, uniqueUserIds),
				),
		}),
	]);

	if (!project) {
		return undefined;
	}

	const userById = new Map(users.map((user) => [user.id, user]));

	const membershipByUserId = new Map(
		memberships.map((membership) => [membership.userId, membership]),
	);

	let teamCollaboratorIds: Set<string> | undefined;

	if (accessRole === "owner") {
		const teamCollaborators = await getTeamCollaboratorProfilesForUser(actorId);

		teamCollaboratorIds = new Set(
			teamCollaborators.map((collaborator) => collaborator.id),
		);
	}

	const assignableUsers = [];

	for (const assigneeUserId of uniqueUserIds) {
		const user = userById.get(assigneeUserId);

		if (!user) {
			continue;
		}

		if (user.id === project.ownerId) {
			assignableUsers.push(user);
			continue;
		}

		const membership = membershipByUserId.get(user.id);

		if (membership?.role === "member") {
			assignableUsers.push(user);
			continue;
		}

		if (membership?.role === "viewer") {
			continue;
		}

		if (accessRole !== "owner" || !teamCollaboratorIds?.has(user.id)) {
			continue;
		}

		const result = await addProjectMemberByUserIdOwnedByUser(
			projectId,
			actorId,
			user.id,
		);

		if (result !== "added" && result !== "already_member") {
			continue;
		}

		assignableUsers.push(user);
	}

	return {
		project,
		users: assignableUsers,
	};
}
