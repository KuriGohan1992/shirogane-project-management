import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { createProjectWithDefaultStages } from "@/lib/db/projects";
import { projectMembers, stages, users } from "@/lib/db/schema";

export async function createTestUser(label: string) {
	const suffix = `${label}-${randomUUID()}`;
	const email = `${suffix}@shiro.test`.toLowerCase();

	const [user] = await db
		.insert(users)
		.values({
			clerkId: `test_${suffix}`,
			email,
			name: `Test ${label}`,
			jobTitle: "Tester",
		})
		.returning();

	if (!user) {
		throw new Error("Failed to create test user.");
	}

	return user;
}

export async function createTestProject(ownerId: string, label: string) {
	return createProjectWithDefaultStages({
		ownerId,
		name: `Test ${label}`,
		description: "Created by the Shiro integration test suite.",
		color: "blue",
		startDate: new Date("2026-08-01T00:00:00.000Z"),
		dueDate: new Date("2026-08-31T00:00:00.000Z"),
	});
}

export async function addTestProjectMember(
	projectId: string,
	userId: string,
	role: "member" | "viewer",
) {
	await db.insert(projectMembers).values({
		projectId,
		userId,
		role,
	});
}

export async function getProjectStages(projectId: string) {
	return db
		.select()
		.from(stages)
		.where(eq(stages.projectId, projectId))
		.orderBy(stages.position);
}
