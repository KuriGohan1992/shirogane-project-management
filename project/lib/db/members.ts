import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";

import type { ProjectMemberRoleValue } from "@/lib/constants/project-roles";
import { db } from "@/lib/db";
import { recordActivity } from "@/lib/db/activity";
import { getProjectAccess } from "@/lib/db/project-access";
import {
	projectMembers,
	projects,
	stages,
	taskAssignees,
	tasks,
} from "@/lib/db/schema";
import { createNotificationsSafely } from "../services/notifications";

type AddProjectMemberResult =
	| "added"
	| "project_not_found"
	| "user_not_found"
	| "owner"
	| "already_member";

type UpdateProjectMemberRoleResult =
	| "updated"
	| "project_not_found"
	| "member_not_found";

function getDisplayName(user: { name: string | null; email: string }) {
	return user.name ?? user.email;
}

export async function addProjectMemberByEmail(
	projectId: string,
	ownerId: string,
	email: string,
): Promise<AddProjectMemberResult> {
	const project = await db.query.projects.findFirst({
		columns: {
			id: true,
			name: true,
		},

		where: (project, { and, eq }) =>
			and(eq(project.id, projectId), eq(project.ownerId, ownerId)),
	});

	if (!project) {
		return "project_not_found";
	}

	const targetUser = await db.query.users.findFirst({
		columns: {
			id: true,
			name: true,
			email: true,
		},

		where: (user) => sql`lower(${user.email}) = ${email}`,
	});

	if (!targetUser) {
		return "user_not_found";
	}

	if (targetUser.id === ownerId) {
		return "owner";
	}

	const [member] = await db
		.insert(projectMembers)
		.values({
			projectId,
			userId: targetUser.id,
			role: "member",
		})
		.onConflictDoNothing()
		.returning({
			userId: projectMembers.userId,
		});

	if (!member) {
		return "already_member";
	}

	await recordActivity({
		projectId,
		actorId: ownerId,
		action: "member_added",
		metadata: {
			memberName: getDisplayName(targetUser),
			memberRole: "member",
		},
	});

	await createNotificationsSafely([
		{
			type: "project_member_added",

			recipientId: targetUser.id,

			actorId: ownerId,

			projectId,

			metadata: {
				projectName: project.name,

				role: "member",
			},
		},
	]);

	return "added";
}

export async function removeProjectMemberOwnedByUser(
	projectId: string,
	memberUserId: string,
	ownerId: string,
): Promise<string | undefined> {
	if (memberUserId === ownerId) {
		return undefined;
	}

	const project = await db.query.projects.findFirst({
		columns: {
			id: true,
			name: true,
		},

		where: (project, { and, eq }) =>
			and(eq(project.id, projectId), eq(project.ownerId, ownerId)),
	});

	if (!project) {
		return undefined;
	}

	const targetMember = await db.query.projectMembers.findFirst({
		where: (member, { and, eq }) =>
			and(eq(member.projectId, projectId), eq(member.userId, memberUserId)),

		with: {
			user: {
				columns: {
					name: true,
					email: true,
				},
			},
		},
	});

	if (!targetMember) {
		return undefined;
	}

	await removeUserAssignmentsFromProject(projectId, memberUserId);

	const [deletedMember] = await db
		.delete(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, memberUserId),
			),
		)
		.returning({
			userId: projectMembers.userId,
		});

	if (!deletedMember) {
		return undefined;
	}

	await recordActivity({
		projectId,
		actorId: ownerId,
		action: "member_removed",
		metadata: {
			memberName: getDisplayName(targetMember.user),
			memberRole: targetMember.role,
		},
	});

	await createNotificationsSafely([
		{
			type: "project_member_removed",

			recipientId: memberUserId,

			actorId: ownerId,

			projectId,

			metadata: {
				projectName: project.name,
			},
		},
	]);

	return project.id;
}

async function removeUserAssignmentsFromProject(
	projectId: string,
	userId: string,
) {
	const project = await db.query.projects.findFirst({
		columns: {
			id: true,
		},

		where: (project, { eq }) => eq(project.id, projectId),

		with: {
			stages: {
				columns: {
					id: true,
				},

				with: {
					tasks: {
						columns: {
							id: true,
						},
					},
				},
			},
		},
	});

	if (!project) {
		return;
	}

	const taskIds = project.stages.flatMap((stage) =>
		stage.tasks.map((task) => task.id),
	);

	if (taskIds.length === 0) {
		return;
	}

	await db
		.delete(taskAssignees)
		.where(
			and(
				eq(taskAssignees.userId, userId),
				inArray(taskAssignees.taskId, taskIds),
			),
		);
}

export async function updateProjectMemberRoleOwnedByUser(
	projectId: string,
	memberUserId: string,
	ownerId: string,
	role: ProjectMemberRoleValue,
): Promise<UpdateProjectMemberRoleResult> {
	const accessRole = await getProjectAccess(projectId, ownerId);

	if (accessRole !== "owner") {
		return "project_not_found";
	}

	const project = await db.query.projects.findFirst({
		columns: {
			name: true,
		},

		where: (project, { eq }) => eq(project.id, projectId),
	});

	if (!project) {
		return "project_not_found";
	}

	const existingMember = await db.query.projectMembers.findFirst({
		columns: {
			role: true,
		},

		where: (member, { and, eq }) =>
			and(eq(member.projectId, projectId), eq(member.userId, memberUserId)),

		with: {
			user: {
				columns: {
					name: true,
					email: true,
				},
			},
		},
	});

	if (!existingMember) {
		return "member_not_found";
	}

	if (role === "viewer" && existingMember.role !== "viewer") {
		await removeUserAssignmentsFromProject(projectId, memberUserId);
	}

	await db
		.update(projectMembers)
		.set({
			role,
		})
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, memberUserId),
			),
		);

	if (existingMember.role !== role) {
		await recordActivity({
			projectId,
			actorId: ownerId,
			action: "member_role_updated",
			metadata: {
				memberName: getDisplayName(existingMember.user),
				previousMemberRole: existingMember.role,
				memberRole: role,
			},
		});

		await createNotificationsSafely([
			{
				type: "project_member_role_changed",

				recipientId: memberUserId,

				actorId: ownerId,

				projectId,

				metadata: {
					projectName: project.name,

					previousRole: existingMember.role,

					role,
				},
			},
		]);
	}

	return "updated";
}

export type RemoveCollaboratorResult =
	| {
			status: "removed";
			projectIds: string[];
			projectCount: number;
			assignmentCount: number;
	  }
	| {
			status: "nothing_to_remove";
	  };

export async function removeCollaboratorFromOwnedProjects(
	collaboratorUserId: string,
	ownerId: string,
): Promise<RemoveCollaboratorResult> {
	if (collaboratorUserId === ownerId) {
		return {
			status: "nothing_to_remove",
		};
	}

	const removableMemberships = await db
		.select({
			projectId: projectMembers.projectId,

			projectName: projects.name,
		})
		.from(projectMembers)
		.innerJoin(projects, eq(projectMembers.projectId, projects.id))
		.where(
			and(
				eq(projectMembers.userId, collaboratorUserId),
				eq(projects.ownerId, ownerId),
			),
		);

	const projectIds = removableMemberships.map(
		(membership) => membership.projectId,
	);

	if (projectIds.length === 0) {
		return {
			status: "nothing_to_remove",
		};
	}

	const projectTasks = await db
		.select({
			id: tasks.id,
		})
		.from(tasks)
		.innerJoin(stages, eq(tasks.stageId, stages.id))
		.where(inArray(stages.projectId, projectIds));

	const taskIds = projectTasks.map((task) => task.id);

	let assignmentCount = 0;

	if (taskIds.length > 0) {
		const removedAssignments = await db
			.delete(taskAssignees)
			.where(
				and(
					eq(taskAssignees.userId, collaboratorUserId),
					inArray(taskAssignees.taskId, taskIds),
				),
			)
			.returning({
				taskId: taskAssignees.taskId,
			});

		assignmentCount = removedAssignments.length;
	}

	await db
		.delete(projectMembers)
		.where(
			and(
				eq(projectMembers.userId, collaboratorUserId),
				inArray(projectMembers.projectId, projectIds),
			),
		);

	await createNotificationsSafely(
	removableMemberships.map(
		(membership) => ({
			type:
				"project_member_removed" as const,

			recipientId:
				collaboratorUserId,

			actorId:
				ownerId,

			projectId:
				membership.projectId,

			metadata: {
				projectName:
					membership.projectName,
			},
		}),
	),
);

	return {
		status: "removed",
		projectIds,
		projectCount: projectIds.length,
		assignmentCount,
	};
}
