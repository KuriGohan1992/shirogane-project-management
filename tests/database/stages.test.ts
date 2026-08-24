import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import {
	createStageInProject,
	deleteStageForUser,
	renameStageForUser,
	reorderStageForUser,
} from "@/lib/db/stages";
import { createTaskInStage } from "@/lib/db/tasks";
import {
	addTestProjectMember,
	createTestProject,
	createTestUser,
	getProjectStages,
} from "./helpers";

describe("stage lifecycle", () => {
	it("allows members to manage stages but rejects viewers", async () => {
		const owner = await createTestUser("stage-owner");
		const member = await createTestUser("stage-member");
		const viewer = await createTestUser("stage-viewer");
		const project = await createTestProject(owner.id, "Stages");

		await addTestProjectMember(project.id, member.id, "member");
		await addTestProjectMember(project.id, viewer.id, "viewer");

		expect(
			await createStageInProject(project.id, viewer.id, { name: "Blocked" }),
		).toBeUndefined();

		const created = await createStageInProject(project.id, member.id, {
			name: "QA",
		});

		expect(created?.stage.name).toBe("QA");

		const renamed = await renameStageForUser(
			created?.stage.id ?? "",
			member.id,
			{
				name: "Quality Assurance",
			},
		);

		expect(renamed?.stage.name).toBe("Quality Assurance");
	});

	it("reorders stages and normalizes their positions", async () => {
		const owner = await createTestUser("stage-reorder-owner");
		const project = await createTestProject(owner.id, "Stage reorder");
		const before = await getProjectStages(project.id);
		const last = before.at(-1);

		if (!last) {
			throw new Error("Expected default stages.");
		}

		expect(await reorderStageForUser(last.id, owner.id, 0)).toBe(project.id);

		const after = await getProjectStages(project.id);

		expect(after[0]?.id).toBe(last.id);
		expect(after.map((stage) => stage.position)).toEqual([0, 1000, 2000, 3000]);
	});

	it("deleting a stage cascades its tasks", async () => {
		const owner = await createTestUser("stage-delete-owner");
		const project = await createTestProject(owner.id, "Stage delete");
		const [stage] = await getProjectStages(project.id);

		if (!stage) {
			throw new Error("Expected a default stage.");
		}

		const createdTask = await createTaskInStage(stage.id, owner.id, {
			title: "Delete with stage",
			description: null,
			priority: null,
			startDate: null,
			dueDate: null,
		});

		if (!createdTask) {
			throw new Error("Expected task creation to succeed.");
		}

		expect(
			await deleteStageForUser(project.id, stage.id, owner.id),
		).toMatchObject({ status: "deleted", projectId: project.id });

		const rows = await db
			.select()
			.from(tasks)
			.where(eq(tasks.id, createdTask.task.id));

		expect(rows).toHaveLength(0);
	});
});
