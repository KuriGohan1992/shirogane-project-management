import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { projectLabels, projectMembers, taskAssignees } from "@/lib/db/schema";
import {
	addTestProjectMember,
	createTestProject,
	createTestUser,
	getProjectStages,
} from "./helpers";

describe("database integrity constraints", () => {
	it("prevents duplicate project memberships", async () => {
		const owner = await createTestUser("membership-owner");
		const member = await createTestUser("membership-member");
		const project = await createTestProject(owner.id, "Membership");

		await addTestProjectMember(project.id, member.id, "member");

		await expect(
			db.insert(projectMembers).values({
				projectId: project.id,
				userId: member.id,
				role: "member",
			}),
		).rejects.toThrow();
	});

	it("prevents duplicate normalized project label names", async () => {
		const owner = await createTestUser("label-owner");
		const project = await createTestProject(owner.id, "Labels");

		await db.insert(projectLabels).values({
			id: randomUUID(),
			projectId: project.id,
			name: "Frontend",
			normalizedName: "frontend",
			color: "cyan",
		});

		await expect(
			db.insert(projectLabels).values({
				id: randomUUID(),
				projectId: project.id,
				name: "FRONTEND",
				normalizedName: "frontend",
				color: "blue",
			}),
		).rejects.toThrow();
	});

	it("prevents duplicate task assignments", async () => {
		const owner = await createTestUser("assignment-owner");
		const member = await createTestUser("assignment-member");
		const project = await createTestProject(owner.id, "Assignments");
		const [stage] = await getProjectStages(project.id);

		if (!stage) {
			throw new Error("Expected a default stage.");
		}

		await addTestProjectMember(project.id, member.id, "member");

		const { createTaskInStage } = await import("@/lib/db/tasks");
		const task = await createTaskInStage(stage.id, owner.id, {
			title: "Task",
			description: null,
			priority: null,
			startDate: null,
			dueDate: null,
		});

		if (!task) {
			throw new Error("Expected task creation to succeed.");
		}

		await db.insert(taskAssignees).values({
			taskId: task.task.id,
			userId: member.id,
		});

		await expect(
			db.insert(taskAssignees).values({
				taskId: task.task.id,
				userId: member.id,
			}),
		).rejects.toThrow();
	});
});
