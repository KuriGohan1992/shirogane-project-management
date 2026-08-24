import { inArray } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import {
	archiveTaskForUser,
	getArchivedTasksForProject,
	restoreArchivedTaskForUser,
} from "@/lib/db/task-archive";
import {
	moveTasksForUser,
	setTaskPriorityForUser,
	setTasksCompletedForUser,
} from "@/lib/db/task-bulk";
import { createTaskInStage } from "@/lib/db/tasks";
import {
	addTestProjectMember,
	createTestProject,
	createTestUser,
	getProjectStages,
} from "./helpers";

async function createTwoTasks(label: string) {
	const owner = await createTestUser(`${label}-owner`);
	const project = await createTestProject(owner.id, label);
	const [firstStage, secondStage] = await getProjectStages(project.id);

	if (!firstStage || !secondStage) {
		throw new Error("Expected at least two default stages.");
	}

	const first = await createTaskInStage(firstStage.id, owner.id, {
		title: `${label} A`,
		description: null,
		priority: null,
		startDate: null,
		dueDate: null,
	});
	const second = await createTaskInStage(firstStage.id, owner.id, {
		title: `${label} B`,
		description: null,
		priority: null,
		startDate: null,
		dueDate: null,
	});

	if (!first || !second) {
		throw new Error("Expected task creation to succeed.");
	}

	return {
		owner,
		project,
		firstStage,
		secondStage,
		taskIds: [first.task.id, second.task.id],
	};
}

describe("task archive", () => {
	it("archives and restores tasks while keeping viewers read-only", async () => {
		const fixture = await createTwoTasks("Archive");
		const viewer = await createTestUser("archive-viewer");

		await addTestProjectMember(fixture.project.id, viewer.id, "viewer");

		expect(
			await archiveTaskForUser(fixture.taskIds[0] ?? "", viewer.id),
		).toBeUndefined();

		expect(
			await archiveTaskForUser(fixture.taskIds[0] ?? "", fixture.owner.id),
		).toBe(fixture.project.id);

		const archived = await getArchivedTasksForProject(
			fixture.project.id,
			fixture.owner.id,
		);

		expect(archived.map((task) => task.id)).toContain(fixture.taskIds[0]);

		expect(
			await restoreArchivedTaskForUser(
				fixture.taskIds[0] ?? "",
				fixture.owner.id,
			),
		).toBe(fixture.project.id);

		expect(
			await getArchivedTasksForProject(fixture.project.id, fixture.owner.id),
		).toHaveLength(0);
	});
});

describe("bulk task mutations", () => {
	it("updates priority, completion, and stage for multiple tasks", async () => {
		const fixture = await createTwoTasks("Bulk");

		expect(
			await setTaskPriorityForUser(
				fixture.project.id,
				fixture.taskIds,
				"urgent",
				fixture.owner.id,
			),
		).toMatchObject({ projectId: fixture.project.id, affectedCount: 2 });

		expect(
			await setTasksCompletedForUser(
				fixture.project.id,
				fixture.taskIds,
				true,
				fixture.owner.id,
			),
		).toMatchObject({ projectId: fixture.project.id, affectedCount: 2 });

		expect(
			await moveTasksForUser(
				fixture.project.id,
				fixture.taskIds,
				fixture.secondStage.id,
				fixture.owner.id,
			),
		).toMatchObject({ projectId: fixture.project.id, affectedCount: 2 });

		const stored = await db
			.select()
			.from(tasks)
			.where(inArray(tasks.id, fixture.taskIds));

		expect(stored).toHaveLength(2);
		expect(stored.every((task) => task.priority === "urgent")).toBe(true);
		expect(stored.every((task) => task.completedAt instanceof Date)).toBe(true);
		expect(
			stored.every((task) => task.stageId === fixture.secondStage.id),
		).toBe(true);
	});

	it("rejects bulk mutations from viewers", async () => {
		const fixture = await createTwoTasks("Bulk viewer");
		const viewer = await createTestUser("bulk-viewer");

		await addTestProjectMember(fixture.project.id, viewer.id, "viewer");

		expect(
			await setTaskPriorityForUser(
				fixture.project.id,
				fixture.taskIds,
				"high",
				viewer.id,
			),
		).toBeUndefined();
	});
});
