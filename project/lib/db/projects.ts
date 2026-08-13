import "server-only";

import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
	type NewProject,
	type Project,
	projects,
	stages,
} from "@/lib/db/schema";

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
	"ownerId" | "name" | "description" | "dueDate"
>;

type UpdateProjectData = Pick<NewProject, "name" | "description" | "dueDate">;

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

	return project;
}

export async function getProjectsOwnedByUser(
	ownerId: string,
): Promise<Project[]> {
	return db.query.projects.findMany({
		where: (project, { eq }) => eq(project.ownerId, ownerId),
		orderBy: (project, { desc }) => [desc(project.updatedAt)],
	});
}

export async function getProjectOwnedByUser(
	projectId: string,
	ownerId: string,
) {
	return db.query.projects.findFirst({
		where: (project, { and, eq }) =>
			and(eq(project.id, projectId), eq(project.ownerId, ownerId)),
		with: {
			stages: {
				orderBy: (stage, { asc }) => [asc(stage.position)],
				with: {
					tasks: {
						where: (task, { isNull }) => isNull(task.archivedAt),
						orderBy: (task, { asc }) => [asc(task.position)],
					},
				},
			},
		},
	});
}

export async function updateProjectOwnedByUser(
	projectId: string,
	ownerId: string,
	data: UpdateProjectData,
): Promise<Project | undefined> {
	const [project] = await db
		.update(projects)
		.set({
			...data,
			updatedAt: new Date(),
		})
		.where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
		.returning();

	return project;
}

export async function deleteProjectOwnedByUser(
	projectId: string,
	ownerId: string,
): Promise<string | undefined> {
	const [deletedProject] = await db
		.delete(projects)
		.where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
		.returning({
			id: projects.id,
		});

	return deletedProject?.id;
}
