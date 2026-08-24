import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import {
	createTaskInStage,
	moveTaskForUser,
	setTaskCompletedForUser,
} from "@/lib/db/tasks";
import {
	addTestProjectMember,
	createTestProject,
	createTestUser,
	getProjectStages,
} from "./helpers";

const taskData = {
	title: "Integration task",
	description: "Created by Vitest",
	priority: "high" as const,
	startDate: null,
	dueDate: new Date("2026-08-30T00:00:00.000Z"),
};

describe("task lifecycle", () => {
	it("lets owners and members create tasks but rejects viewers", async () => {
		const owner = await createTestUser("task-owner");
		const member = await createTestUser("task-member");
		const viewer = await createTestUser("task-viewer");
		const project = await createTestProject(owner.id, "Tasks");
		const [backlog] = await getProjectStages(project.id);

		if (!backlog) {
			throw new Error("Expected a default stage.");
		}

		await addTestProjectMember(project.id, member.id, "member");
		await addTestProjectMember(project.id, viewer.id, "viewer");

		expect(
			await createTaskInStage(backlog.id, viewer.id, taskData),
		).toBeUndefined();

		const memberTask = await createTaskInStage(backlog.id, member.id, taskData);

		expect(memberTask?.projectId).toBe(project.id);
		expect(memberTask?.task.title).toBe(taskData.title);
	});

	it("moves tasks between stages and normalizes their stage", async () => {
		const owner = await createTestUser("move-owner");
		const project = await createTestProject(owner.id, "Move");
		const [backlog, toDo] = await getProjectStages(project.id);

		if (!backlog || !toDo) {
			throw new Error("Expected at least two default stages.");
		}

		const result = await createTaskInStage(backlog.id, owner.id, taskData);

		if (!result) {
			throw new Error("Expected task creation to succeed.");
		}

		expect(await moveTaskForUser(result.task.id, toDo.id, owner.id, 0)).toBe(
			project.id,
		);

		const moved = await db.query.tasks.findFirst({
			where: (task, { eq }) => eq(task.id, result.task.id),
		});

		expect(moved?.stageId).toBe(toDo.id);
		expect(moved?.position).toBe(0);
	});

	it("completes and reopens a task idempotently", async () => {
		const owner = await createTestUser("complete-owner");
		const project = await createTestProject(owner.id, "Complete");
		const [stage] = await getProjectStages(project.id);

		if (!stage) {
			throw new Error("Expected a default stage.");
		}

		const result = await createTaskInStage(stage.id, owner.id, taskData);

		if (!result) {
			throw new Error("Expected task creation to succeed.");
		}

		const completed = await setTaskCompletedForUser(
			result.task.id,
			owner.id,
			true,
		);

		expect(completed?.task.completedAt).toBeInstanceOf(Date);

		const completedAgain = await setTaskCompletedForUser(
			result.task.id,
			owner.id,
			true,
		);

		expect(completedAgain?.task.completedAt).toBeInstanceOf(Date);

		const reopened = await setTaskCompletedForUser(
			result.task.id,
			owner.id,
			false,
		);

		expect(reopened?.task.completedAt).toBeNull();

		const [stored] = await db
			.select()
			.from(tasks)
			.where(eq(tasks.id, result.task.id));

		expect(stored?.completedAt).toBeNull();
	});
});
