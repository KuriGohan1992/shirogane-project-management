import "server-only";

import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { getProjectsForUser } from "@/lib/db/projects";
import { stages, taskAssignees, tasks } from "@/lib/db/schema";
import type {
	TeamCollaborator,
	TeamDirectoryData,
	TeamSharedProject,
} from "@/types/team";
import type { UserProfileSummary } from "@/types/user";

function getDisplayName(user: UserProfileSummary) {
	return user.name?.trim() || user.email;
}

async function getTeamBaseForUser(userId: string) {
	const accessibleProjects = await getProjectsForUser(userId);

	if (accessibleProjects.length === 0) {
		return {
			accessibleProjects,
			collaboratorsByUserId: new Map<string, TeamCollaborator>(),
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
					jobTitle: true,
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
		user: UserProfileSummary,
		project: TeamSharedProject,
	) {
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
		if (project.ownerId !== userId) {
			addCollaboratorProject(project.owner, {
				id: project.id,
				name: project.name,
				color: project.color,
				completedAt: project.completedAt,
				lastActivityAt: project.lastActivityAt,
				role: "owner",
				tasks: [],
				canRemoveMember: project.accessRole === "owner",
				yourRole: project.accessRole,
			});
		}

		for (const membership of membershipsByProjectId.get(project.id) ?? []) {
			addCollaboratorProject(membership.user, {
				id: project.id,
				name: project.name,
				color: project.color,
				completedAt: project.completedAt,
				lastActivityAt: project.lastActivityAt,
				role: membership.role,
				tasks: [],
				canRemoveMember: project.accessRole === "owner",
				yourRole: project.accessRole,
			});
		}
	}

	return {
		accessibleProjects,
		collaboratorsByUserId,
	};
}

export async function getTeamCollaboratorProfilesForUser(
	userId: string,
): Promise<UserProfileSummary[]> {
	const [ownedProjects, memberships] = await Promise.all([
		db.query.projects.findMany({
			columns: {
				id: true,
			},

			where: (project, { eq }) => eq(project.ownerId, userId),
		}),

		db.query.projectMembers.findMany({
			columns: {
				projectId: true,
			},

			where: (member, { eq }) => eq(member.userId, userId),
		}),
	]);

	const projectIds = [
		...ownedProjects.map((project) => project.id),
		...memberships.map((membership) => membership.projectId),
	];

	const uniqueProjectIds = [...new Set(projectIds)];

	if (uniqueProjectIds.length === 0) {
		return [];
	}

	const [projectOwners, projectMemberships] = await Promise.all([
		db.query.projects.findMany({
			columns: {
				id: true,
			},

			where: (project) => inArray(project.id, uniqueProjectIds),

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
			},
		}),

		db.query.projectMembers.findMany({
			columns: {
				userId: true,
			},

			where: (member) => inArray(member.projectId, uniqueProjectIds),

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
		}),
	]);

	const collaboratorsByUserId = new Map<string, UserProfileSummary>();

	for (const project of projectOwners) {
		if (project.owner.id !== userId) {
			collaboratorsByUserId.set(project.owner.id, project.owner);
		}
	}

	for (const membership of projectMemberships) {
		if (membership.user.id !== userId) {
			collaboratorsByUserId.set(membership.user.id, membership.user);
		}
	}

	return Array.from(collaboratorsByUserId.values()).sort((a, b) =>
		getDisplayName(a).localeCompare(getDisplayName(b), "en-US", {
			sensitivity: "base",
		}),
	);
}

export async function getTeamDirectoryForUser(
	userId: string,
): Promise<TeamDirectoryData> {
	const { accessibleProjects, collaboratorsByUserId } =
		await getTeamBaseForUser(userId);

	if (accessibleProjects.length === 0) {
		return {
			collaborators: [],
			projects: [],
		};
	}

	const projectIds = accessibleProjects.map((project) => project.id);

	const collaboratorIds = Array.from(collaboratorsByUserId.keys());

	if (collaboratorIds.length > 0) {
		const assignments = await db
			.select({
				userId: taskAssignees.userId,

				projectId: stages.projectId,

				taskId: tasks.id,

				title: tasks.title,

				stageName: stages.name,

				stagePosition: stages.position,

				taskPosition: tasks.position,
				completedAt: tasks.completedAt,
			})
			.from(taskAssignees)
			.innerJoin(tasks, eq(taskAssignees.taskId, tasks.id))
			.innerJoin(stages, eq(tasks.stageId, stages.id))
			.where(
				and(
					inArray(taskAssignees.userId, collaboratorIds),

					inArray(stages.projectId, projectIds),

					isNull(tasks.archivedAt),
				),
			)
			.orderBy(asc(stages.position), asc(tasks.position));

		for (const assignment of assignments) {
			const collaborator = collaboratorsByUserId.get(assignment.userId);

			if (!collaborator) {
				continue;
			}

			const project = collaborator.projects.find(
				(sharedProject) => sharedProject.id === assignment.projectId,
			);

			if (!project) {
				continue;
			}

			project.tasks.push({
				id: assignment.taskId,
				title: assignment.title,
				completedAt: assignment.completedAt,
				stageName: assignment.stageName,
			});
		}
	}

	const collaborators = Array.from(collaboratorsByUserId.values())
		.map((collaborator) => ({
			...collaborator,

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
