"use server";

import { buildAssignmentCandidates } from "@/lib/assignment-candidates";
import { getCurrentDatabaseUser } from "@/lib/auth/current-user";
import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import { getProjectActivityForUser } from "@/lib/db/activity";
import { getArchivedTasksForProject } from "@/lib/db/task-archive";
import { getTeamCollaboratorProfilesForUser } from "@/lib/db/team";
import { projectIdSchema } from "@/lib/validations/project";
import type { ActivityWithActor } from "@/types/activity";
import type { AssignmentCandidate } from "@/types/member";
import type { ArchivedTaskSummary } from "@/types/task";

export async function loadProjectActivityAction(
	projectId: string,
): Promise<ActivityWithActor[]> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	if (!projectIdResult.success) {
		throw new Error("The selected project is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	const activities = await getProjectActivityForUser(
		projectIdResult.data,
		user.id,
	);

	if (!activities) {
		throw new Error("You do not have access to this project's activity.");
	}

	return activities;
}

export async function loadArchivedTasksAction(
	projectId: string,
): Promise<ArchivedTaskSummary[]> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	if (!projectIdResult.success) {
		throw new Error("The selected project is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	return getArchivedTasksForProject(projectIdResult.data, user.id);
}

export async function loadAssignmentCandidatesAction(
	projectId: string,
): Promise<AssignmentCandidate[]> {
	const projectIdResult = projectIdSchema.safeParse(projectId);

	if (!projectIdResult.success) {
		throw new Error("The selected project is invalid.");
	}

	const user = await getCurrentDatabaseUser();

	const project = await db.query.projects.findFirst({
		columns: {
			id: true,
			ownerId: true,
		},

		where: (project, { eq }) => eq(project.id, projectIdResult.data),

		with: {
			owner: {
				columns: {
					id: true,
					name: true,
					email: true,
					imageUrl: true,
					jobTitle: true,
				},
			},

			members: {
				orderBy: (member, { asc }) => [asc(member.joinedAt)],

				with: {
					user: {
						columns: {
							id: true,
							name: true,
							email: true,
							imageUrl: true,
							jobTitle: true,
						},
					},
				},
			},
		},
	});

	if (!project) {
		throw new Error("The selected project could not be found.");
	}

	const accessRole =
		project.ownerId === user.id
			? ("owner" as const)
			: project.members.find((member) => member.userId === user.id)?.role;

	if (!accessRole) {
		throw new Error("You do not have access to this project.");
	}

	const permissions = getProjectPermissions(accessRole);

	const teamCollaborators = permissions.canManageMembers
		? await getTeamCollaboratorProfilesForUser(user.id)
		: [];

	return buildAssignmentCandidates({
		owner: project.owner,
		members: project.members,
		teamCollaborators,
		canManageMembers: permissions.canManageMembers,
	});
}
