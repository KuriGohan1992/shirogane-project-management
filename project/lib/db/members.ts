import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { projectMembers, taskAssignees } from "@/lib/db/schema";

type AddProjectMemberResult =
	| "added"
	| "project_not_found"
	| "user_not_found"
	| "owner"
	| "already_member";

export async function addProjectMemberByEmail(
	projectId: string,
	ownerId: string,
	email: string,
): Promise<AddProjectMemberResult> {
	const project = await db.query.projects.findFirst({
		columns: {
			id: true,
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
		},

		where: (project, { and, eq }) =>
			and(eq(project.id, projectId), eq(project.ownerId, ownerId)),

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
		return undefined;
	}

	const taskIds = project.stages.flatMap((stage) =>
		stage.tasks.map((task) => task.id),
	);

	const deleteMembership = db
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

	if (taskIds.length === 0) {
		const [deletedMember] = await deleteMembership;

		return deletedMember ? project.id : undefined;
	}

	const [, deletedMembers] = await db.batch([
		db
			.delete(taskAssignees)
			.where(
				and(
					eq(taskAssignees.userId, memberUserId),
					inArray(taskAssignees.taskId, taskIds),
				),
			),

		deleteMembership,
	]);

	return deletedMembers[0] ? project.id : undefined;
}
