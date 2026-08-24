import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { assignUserToTask } from "@/lib/db/assignees";
import {
	addProjectMemberByUserIdOwnedByUser,
	updateProjectMemberRoleOwnedByUser,
} from "@/lib/db/members";
import { projectMembers, taskAssignees } from "@/lib/db/schema";
import { createTaskInStage } from "@/lib/db/tasks";
import { createTestProject, createTestUser, getProjectStages } from "./helpers";

describe("collaborators and assignments", () => {
	it("adds existing Shiro users to an owned project once", async () => {
		const owner = await createTestUser("member-owner");
		const collaborator = await createTestUser("member-target");
		const project = await createTestProject(owner.id, "Members");

		expect(
			await addProjectMemberByUserIdOwnedByUser(
				project.id,
				owner.id,
				collaborator.id,
			),
		).toBe("added");

		expect(
			await addProjectMemberByUserIdOwnedByUser(
				project.id,
				owner.id,
				collaborator.id,
			),
		).toBe("already_member");
	});

	it("removes task assignments when a member becomes a viewer", async () => {
		const owner = await createTestUser("role-owner");
		const collaborator = await createTestUser("role-target");
		const project = await createTestProject(owner.id, "Roles");
		const [stage] = await getProjectStages(project.id);

		if (!stage) {
			throw new Error("Expected a default stage.");
		}

		await addProjectMemberByUserIdOwnedByUser(
			project.id,
			owner.id,
			collaborator.id,
		);

		const task = await createTaskInStage(stage.id, owner.id, {
			title: "Assigned work",
			description: null,
			priority: null,
			startDate: null,
			dueDate: null,
		});

		if (!task) {
			throw new Error("Expected task creation to succeed.");
		}

		expect(
			await assignUserToTask(task.task.id, collaborator.id, owner.id),
		).toMatchObject({ status: "assigned" });

		expect(
			await updateProjectMemberRoleOwnedByUser(
				project.id,
				collaborator.id,
				owner.id,
				"viewer",
			),
		).toBe("updated");

		const assignments = await db
			.select()
			.from(taskAssignees)
			.where(eq(taskAssignees.userId, collaborator.id));

		expect(assignments).toHaveLength(0);

		const [membership] = await db
			.select()
			.from(projectMembers)
			.where(eq(projectMembers.userId, collaborator.id));

		expect(membership?.role).toBe("viewer");
	});
});
