import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import {
	createCommentForTask,
	deleteCommentForUser,
	updateCommentForUser,
} from "@/lib/db/comments";
import {
	assignLabelToTask,
	createProjectLabelForUser,
	unassignLabelFromTask,
} from "@/lib/db/labels";
import { taskComments, taskLabels } from "@/lib/db/schema";
import { createTaskInStage } from "@/lib/db/tasks";
import {
	addTestProjectMember,
	createTestProject,
	createTestUser,
	getProjectStages,
} from "./helpers";

async function createTaskFixture(label: string) {
	const owner = await createTestUser(`${label}-owner`);
	const project = await createTestProject(owner.id, label);
	const [stage] = await getProjectStages(project.id);

	if (!stage) {
		throw new Error("Expected a default stage.");
	}

	const result = await createTaskInStage(stage.id, owner.id, {
		title: `${label} task`,
		description: null,
		priority: null,
		startDate: null,
		dueDate: null,
	});

	if (!result) {
		throw new Error("Expected task creation to succeed.");
	}

	return { owner, project, task: result.task };
}

describe("labels", () => {
	it("creates labels idempotently and assigns them to tasks", async () => {
		const { owner, project, task } = await createTaskFixture("Labels");

		const first = await createProjectLabelForUser(project.id, owner.id, {
			name: "Frontend",
			color: "cyan",
		});
		const second = await createProjectLabelForUser(project.id, owner.id, {
			name: " frontend ",
			color: "blue",
		});

		expect(first.status).toBe("created");
		expect(second.status).toBe("existing");

		if (!("label" in first)) {
			throw new Error("Expected a label result.");
		}

		expect(
			await assignLabelToTask(task.id, first.label.id, owner.id),
		).toMatchObject({ status: "assigned", projectId: project.id });

		expect(
			await db.select().from(taskLabels).where(eq(taskLabels.taskId, task.id)),
		).toHaveLength(1);

		expect(
			await unassignLabelFromTask(task.id, first.label.id, owner.id),
		).toMatchObject({ status: "unassigned", projectId: project.id });

		expect(
			await db.select().from(taskLabels).where(eq(taskLabels.taskId, task.id)),
		).toHaveLength(0);
	});
});

describe("comments", () => {
	it("lets members comment, edit their own comment, and prevents viewers", async () => {
		const { owner, project, task } = await createTaskFixture("Comments");
		const member = await createTestUser("comments-member");
		const viewer = await createTestUser("comments-viewer");

		await addTestProjectMember(project.id, member.id, "member");
		await addTestProjectMember(project.id, viewer.id, "viewer");

		expect(
			await createCommentForTask(task.id, viewer.id, "Blocked"),
		).toBeUndefined();

		const result = await createCommentForTask(task.id, member.id, "First");

		expect(result?.comment.content).toBe("First");

		if (!result) {
			throw new Error("Expected comment creation to succeed.");
		}

		expect(
			await updateCommentForUser(result.comment.id, owner.id, "Owner edit"),
		).toBeUndefined();

		expect(
			await updateCommentForUser(result.comment.id, member.id, "Edited"),
		).toMatchObject({
			comment: expect.objectContaining({ content: "Edited" }),
			projectId: project.id,
		});
	});

	it("allows the project owner to delete a collaborator comment", async () => {
		const { owner, project, task } = await createTaskFixture("Comment delete");
		const member = await createTestUser("comment-delete-member");

		await addTestProjectMember(project.id, member.id, "member");

		const result = await createCommentForTask(task.id, member.id, "Temporary");

		if (!result) {
			throw new Error("Expected comment creation to succeed.");
		}

		expect(await deleteCommentForUser(result.comment.id, owner.id)).toBe(
			project.id,
		);

		expect(
			await db
				.select()
				.from(taskComments)
				.where(eq(taskComments.id, result.comment.id)),
		).toHaveLength(0);
	});
});
