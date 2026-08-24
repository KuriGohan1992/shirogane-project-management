import { describe, expect, it } from "vitest";

import { getProjectActivityForUser } from "@/lib/db/activity";
import { searchProjectsAndTasksForUser } from "@/lib/db/search";
import { archiveTaskForUser } from "@/lib/db/task-archive";
import { createTaskInStage } from "@/lib/db/tasks";
import {
	addTestProjectMember,
	createTestProject,
	createTestUser,
	getProjectStages,
} from "./helpers";

describe("global search", () => {
	it("returns only accessible projects and active tasks", async () => {
		const owner = await createTestUser("search-owner");
		const collaborator = await createTestUser("search-collaborator");
		const outsider = await createTestUser("search-outsider");
		const accessible = await createTestProject(owner.id, "Nebula Alpha");
		await createTestProject(outsider.id, "Nebula Private");
		await addTestProjectMember(accessible.id, collaborator.id, "member");

		const [stage] = await getProjectStages(accessible.id);

		if (!stage) {
			throw new Error("Expected a default stage.");
		}

		const active = await createTaskInStage(stage.id, owner.id, {
			title: "Nebula active task",
			description: null,
			priority: null,
			startDate: null,
			dueDate: null,
		});
		const archived = await createTaskInStage(stage.id, owner.id, {
			title: "Nebula archived task",
			description: null,
			priority: null,
			startDate: null,
			dueDate: null,
		});

		if (!active || !archived) {
			throw new Error("Expected task creation to succeed.");
		}

		await archiveTaskForUser(archived.task.id, owner.id);

		const results = await searchProjectsAndTasksForUser(
			collaborator.id,
			"Nebula",
		);

		expect(results.projects.map((project) => project.name)).toEqual([
			"Test Nebula Alpha",
		]);
		expect(results.tasks.map((task) => task.id)).toEqual([active.task.id]);
	});
});

describe("activity history", () => {
	it("records project and task lifecycle activity for authorized users", async () => {
		const owner = await createTestUser("activity-owner");
		const outsider = await createTestUser("activity-outsider");
		const project = await createTestProject(owner.id, "Activity");
		const [stage] = await getProjectStages(project.id);

		if (!stage) {
			throw new Error("Expected a default stage.");
		}

		await createTaskInStage(stage.id, owner.id, {
			title: "Activity task",
			description: null,
			priority: null,
			startDate: null,
			dueDate: null,
		});

		const activity = await getProjectActivityForUser(project.id, owner.id);

		expect(activity?.map((entry) => entry.action)).toEqual(
			expect.arrayContaining(["project_created", "task_created"]),
		);
		expect(
			await getProjectActivityForUser(project.id, outsider.id),
		).toBeUndefined();
	});
});
