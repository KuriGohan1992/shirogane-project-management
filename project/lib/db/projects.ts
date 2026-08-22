import "server-only";

import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { getProjectPermissions } from "@/lib/auth/project-permissions";
import { db } from "@/lib/db";
import {
	getLatestProjectActivityDates,
	recordActivity,
} from "@/lib/db/activity";
import { getProjectAccess } from "@/lib/db/project-access";
import {
	type NewProject,
	type Project,
	projects,
	stages,
} from "@/lib/db/schema";
import type { ProjectWithAccess } from "@/types/project";

export const DEFAULT_PROJECT_STAGES = [
	{
		name: "Backlog",
		position: 0,
	},
	{
		name: "To Do",
		position: 1000,
	},
	{
		name: "In Progress",
		position: 2000,
	},
	{
		name: "Done",
		position: 3000,
	},
] as const;

type CreateProjectData = Pick<
	NewProject,
	"ownerId" | "name" | "description" | "color" | "startDate" | "dueDate"
>;

type UpdateProjectData = Pick<
	NewProject,
	"name" | "description" | "color" | "startDate" | "dueDate"
>;

function datesMatch(
	left: Date | null | undefined,
	right: Date | null | undefined,
) {
	return left?.getTime() === right?.getTime();
}

function getChangedProjectFields(project: Project, data: UpdateProjectData) {
	const changedFields: string[] = [];

	if (project.name !== data.name) {
		changedFields.push("name");
	}

	if (project.description !== data.description) {
		changedFields.push("description");
	}

	if (project.color !== data.color) {
		changedFields.push("color");
	}

	if (!datesMatch(project.startDate, data.startDate)) {
		changedFields.push("start date");
	}

	if (!datesMatch(project.dueDate, data.dueDate)) {
		changedFields.push("due date");
	}

	return changedFields;
}

export async function createProjectWithDefaultStages(
	data: CreateProjectData,
): Promise<Project> {
	const projectId = randomUUID();

	const [projectResult] = await db.batch([
		db
			.insert(projects)
			.values({
				id: projectId,
				...data,
			})
			.returning(),

		db.insert(stages).values(
			DEFAULT_PROJECT_STAGES.map((stage) => ({
				projectId,
				name: stage.name,
				position: stage.position,
			})),
		),
	]);

	const project = projectResult[0];

	if (!project) {
		throw new Error("Failed to create project.");
	}

	await recordActivity({
		projectId: project.id,
		actorId: data.ownerId,
		action: "project_created",
		metadata: {
			projectName: project.name,
		},
	});

	return project;
}

export async function getProjectsForUser(
	userId: string,
): Promise<ProjectWithAccess[]> {
	const [ownedProjects, memberships] = await Promise.all([
		db.query.projects.findMany({
			where: (project, { eq }) => eq(project.ownerId, userId),

			with: {
				owner: {
					columns: {
						id: true,
						name: true,
						email: true,
						imageUrl: true,
					},
				},
			},
		}),

		db.query.projectMembers.findMany({
			columns: {
				role: true,
			},

			where: (member, { eq }) => eq(member.userId, userId),

			with: {
				project: {
					with: {
						owner: {
							columns: {
								id: true,
								name: true,
								email: true,
								imageUrl: true,
							},
						},
					},
				},
			},
		}),
	]);

	const accessibleProjects = [
		...ownedProjects.map((project) => ({
			...project,
			accessRole: "owner" as const,
		})),

		...memberships.map((membership) => ({
			...membership.project,
			accessRole: membership.role,
		})),
	];

	const latestActivities = await getLatestProjectActivityDates(
		accessibleProjects.map((project) => project.id),
	);

	const latestActivityByProjectId = new Map(
		latestActivities.map((activity) => [
			activity.projectId,
			activity.createdAt,
		]),
	);

	const projectsWithActivity: ProjectWithAccess[] = accessibleProjects.map(
		(project) => ({
			...project,

			lastActivityAt:
				latestActivityByProjectId.get(project.id) ?? project.updatedAt,
		}),
	);

	return projectsWithActivity.sort(
		(a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime(),
	);
}

export async function getProjectForUser(projectId: string, userId: string) {
	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole) {
		return undefined;
	}

	const project = await db.query.projects.findFirst({
		where: (project, { eq }) => eq(project.id, projectId),

		with: {
			owner: {
				columns: {
					id: true,
					name: true,
					email: true,
					imageUrl: true,
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
						},
					},
				},
			},

			labels: {
				orderBy: (label, { asc }) => [asc(label.name)],
			},

			stages: {
				orderBy: (stage, { asc }) => [asc(stage.position)],

				with: {
					tasks: {
						where: (task, { isNull }) => isNull(task.archivedAt),

						orderBy: (task, { asc }) => [asc(task.position)],

						with: {
							assignees: {
								orderBy: (assignee, { asc }) => [asc(assignee.assignedAt)],

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
							},

							labels: {
								with: {
									label: true,
								},
							},

							comments: {
								orderBy: (comment, { asc }) => [asc(comment.createdAt)],

								with: {
									author: {
										columns: {
											id: true,
											name: true,
											email: true,
											imageUrl: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});

	if (!project) {
		return undefined;
	}

	return {
		...project,
		accessRole,
	};
}

export async function updateProjectForUser(
	projectId: string,
	userId: string,
	data: UpdateProjectData,
): Promise<Project | undefined> {
	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canEditProject) {
		return undefined;
	}

	const existingProject = await db.query.projects.findFirst({
		where: (project, { eq }) => eq(project.id, projectId),
	});

	if (!existingProject) {
		return undefined;
	}

	const changedFields = getChangedProjectFields(existingProject, data);

	const [project] = await db
		.update(projects)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(eq(projects.id, projectId))
		.returning();

	if (!project) {
		return undefined;
	}

	if (changedFields.length > 0) {
		await recordActivity({
			projectId,
			actorId: userId,
			action: "project_updated",
			metadata: {
				projectName: project.name,
				changedFields: changedFields.join(", "),
			},
		});
	}

	return project;
}

export async function setProjectCompletedForUser(
	projectId: string,
	userId: string,
	completed: boolean,
): Promise<Project | undefined> {
	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canCompleteProject) {
		return undefined;
	}

	const existingProject = await db.query.projects.findFirst({
		where: (project, { eq }) => eq(project.id, projectId),
	});

	if (!existingProject) {
		return undefined;
	}

	const isCurrentlyCompleted = existingProject.completedAt !== null;

	if (isCurrentlyCompleted === completed) {
		return existingProject;
	}

	const changedAt = new Date();

	const [project] = await db
		.update(projects)
		.set({
			completedAt: completed ? changedAt : null,
			updatedAt: changedAt,
		})
		.where(eq(projects.id, projectId))
		.returning();

	if (!project) {
		return undefined;
	}

	await recordActivity({
		projectId,
		actorId: userId,
		action: completed ? "project_completed" : "project_reactivated",
		metadata: {
			projectName: project.name,
		},
	});

	return project;
}

export async function deleteProjectForUser(
	projectId: string,
	userId: string,
): Promise<string | undefined> {
	const accessRole = await getProjectAccess(projectId, userId);

	if (!accessRole || !getProjectPermissions(accessRole).canDeleteProject) {
		return undefined;
	}

	const [deletedProject] = await db
		.delete(projects)
		.where(eq(projects.id, projectId))
		.returning({
			id: projects.id,
		});

	return deletedProject?.id;
}
