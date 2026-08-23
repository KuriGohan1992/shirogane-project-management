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
		/*
		 * The Team page is a collaborator directory,
		 * so don't include the current user.
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
		 * If somebody else owns an accessible project,
		 * they're one of the current user's collaborators.
		 */
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

		/*
		 * Explicit project members/viewers.
		 */
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

	/*
	 * Fetch every active task assigned to one of the collaborators
	 * across projects the current user can access.
	 *
	 * This stays one query regardless of how many collaborator cards
	 * are displayed.
	 */
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
				stageName: assignment.stageName,
			});
		}
	}

	const collaborators = Array.from(collaboratorsByUserId.values())
		.map((collaborator) => ({
			...collaborator,

			/*
			 * Keep shared projects sorted by the project's activity.
			 * We no longer display the timestamp in the UI.
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
