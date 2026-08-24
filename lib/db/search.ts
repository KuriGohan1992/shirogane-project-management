import "server-only";

import { and, asc, eq, ilike, inArray, isNull, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { projectMembers, projects, stages, tasks } from "@/lib/db/schema";
import type { GlobalSearchResults } from "@/types/search";
import { SEARCH_LIMITS } from "../constants/search";

export async function searchProjectsAndTasksForUser(
	userId: string,
	query: string,
): Promise<GlobalSearchResults> {
	const normalizedQuery = query.trim();

	if (normalizedQuery.length < SEARCH_LIMITS.minQueryLength) {
		return {
			projects: [],
			tasks: [],
		};
	}

	const accessibleProjects = await db
		.select({
			id: projects.id,
		})
		.from(projects)
		.leftJoin(
			projectMembers,
			and(
				eq(projectMembers.projectId, projects.id),
				eq(projectMembers.userId, userId),
			),
		)
		.where(or(eq(projects.ownerId, userId), eq(projectMembers.userId, userId)));

	const projectIds = accessibleProjects.map((project) => project.id);

	if (projectIds.length === 0) {
		return {
			projects: [],
			tasks: [],
		};
	}

	const pattern = `%${normalizedQuery}%`;

	const [projectResults, taskResults] = await Promise.all([
		db
			.select({
				id: projects.id,
				name: projects.name,
				description: projects.description,
			})
			.from(projects)
			.where(
				and(
					inArray(projects.id, projectIds),
					or(
						ilike(projects.name, pattern),
						ilike(projects.description, pattern),
					),
				),
			)
			.orderBy(asc(projects.name))
			.limit(SEARCH_LIMITS.projectResults),

		db
			.select({
				id: tasks.id,
				title: tasks.title,
				projectId: projects.id,
				projectName: projects.name,
				stageName: stages.name,
			})
			.from(tasks)
			.innerJoin(stages, eq(tasks.stageId, stages.id))
			.innerJoin(projects, eq(stages.projectId, projects.id))
			.where(
				and(
					inArray(projects.id, projectIds),
					isNull(tasks.archivedAt),
					or(ilike(tasks.title, pattern), ilike(tasks.description, pattern)),
				),
			)
			.orderBy(asc(tasks.title))
			.limit(SEARCH_LIMITS.taskResults),
	]);

	return {
		projects: projectResults,
		tasks: taskResults,
	};
}
