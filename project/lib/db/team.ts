import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { getProjectsForUser } from "@/lib/db/projects";
import type {
	TeamCollaborator,
	TeamDirectoryData,
	TeamSharedProject,
} from "@/types/team";
import type { UserSummary } from "@/types/user";

function getDisplayName(user: UserSummary) {
	return user.name?.trim() || user.email;
}

export async function getTeamDirectoryForUser(
	userId: string,
): Promise<TeamDirectoryData> {
	const accessibleProjects = await getProjectsForUser(userId);

	if (accessibleProjects.length === 0) {
		return {
			collaborators: [],
			projects: [],
		};
	}

	const projectIds = accessibleProjects.map((project) => project.id);

	const memberships = await db.query.projectMembers.findMany({
		columns: {
			projectId: true,
			userId: true,
			role: true,
		},

		where: (member) => inArray(member.projectId, projectIds),

		with: {
			user: {
				columns: {
					id: true,
					name: true,
					email: true,
					imageUrl: true,
				},
			},
		},
	});

	type ProjectMembership = (typeof memberships)[number];

	const membershipsByProjectId = new Map<string, ProjectMembership[]>();

	for (const membership of memberships) {
		const projectMemberships =
			membershipsByProjectId.get(membership.projectId) ?? [];

		projectMemberships.push(membership);

		membershipsByProjectId.set(membership.projectId, projectMemberships);
	}

	const collaboratorsByUserId = new Map<string, TeamCollaborator>();

	function addCollaboratorProject(
		user: UserSummary,
		project: TeamSharedProject,
	) {
		/*
		 * The Team page is a collaborator directory,
		 * so the current user is intentionally excluded.
		 */
		if (user.id === userId) {
			return;
		}

		const existingCollaborator = collaboratorsByUserId.get(user.id);

		if (existingCollaborator) {
			const alreadyHasProject = existingCollaborator.projects.some(
				(sharedProject) => sharedProject.id === project.id,
			);

			if (!alreadyHasProject) {
				existingCollaborator.projects.push(project);
			}

			return;
		}

		collaboratorsByUserId.set(user.id, {
			...user,
			projects: [project],
		});
	}

	for (const project of accessibleProjects) {
		/*
		 * If someone else owns an accessible project,
		 * they are one of the current user's collaborators.
		 */
		if (project.ownerId !== userId) {
			addCollaboratorProject(project.owner, {
				id: project.id,
				name: project.name,
				color: project.color,
				completedAt: project.completedAt,
				lastActivityAt: project.lastActivityAt,
				role: "owner",
			});
		}

		/*
		 * Everyone else explicitly belonging to the project
		 * is also part of the collaborator directory.
		 */
		for (const membership of membershipsByProjectId.get(project.id) ?? []) {
			addCollaboratorProject(membership.user, {
				id: project.id,
				name: project.name,
				color: project.color,
				completedAt: project.completedAt,
				lastActivityAt: project.lastActivityAt,
				role: membership.role,
			});
		}
	}

	const collaborators = Array.from(collaboratorsByUserId.values())
		.map((collaborator) => ({
			...collaborator,

			/*
			 * Put the person's most recently active shared
			 * projects first.
			 */
			projects: collaborator.projects.sort(
				(a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime(),
			),
		}))
		.sort((a, b) =>
			getDisplayName(a).localeCompare(getDisplayName(b), "en-US", {
				sensitivity: "base",
			}),
		);

	const projects = accessibleProjects
		.map((project) => ({
			id: project.id,
			name: project.name,
			color: project.color,
		}))
		.sort((a, b) =>
			a.name.localeCompare(b.name, "en-US", {
				sensitivity: "base",
			}),
		);

	return {
		collaborators,
		projects,
	};
}
