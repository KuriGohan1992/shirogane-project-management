import { describe, expect, it } from "vitest";

import { getProjectAccess } from "@/lib/db/project-access";
import {
	DEFAULT_PROJECT_STAGES,
	deleteProjectForUser,
	setProjectCompletedForUser,
	updateProjectForUser,
} from "@/lib/db/projects";
import {
	addTestProjectMember,
	createTestProject,
	createTestUser,
	getProjectStages,
} from "./helpers";

describe("project lifecycle", () => {
	it("creates a project with the default Shiro stages", async () => {
		const owner = await createTestUser("project-owner");
		const project = await createTestProject(owner.id, "Project");

		const stages = await getProjectStages(project.id);

		expect(stages.map((stage) => stage.name)).toEqual(
			DEFAULT_PROJECT_STAGES.map((stage) => stage.name),
		);
		expect(stages.map((stage) => stage.position)).toEqual(
			DEFAULT_PROJECT_STAGES.map((stage) => stage.position),
		);
	});

	it("resolves owner, member, viewer, and no-access roles", async () => {
		const owner = await createTestUser("access-owner");
		const member = await createTestUser("access-member");
		const viewer = await createTestUser("access-viewer");
		const outsider = await createTestUser("access-outsider");
		const project = await createTestProject(owner.id, "Access");

		await addTestProjectMember(project.id, member.id, "member");
		await addTestProjectMember(project.id, viewer.id, "viewer");

		expect(await getProjectAccess(project.id, owner.id)).toBe("owner");
		expect(await getProjectAccess(project.id, member.id)).toBe("member");
		expect(await getProjectAccess(project.id, viewer.id)).toBe("viewer");
		expect(await getProjectAccess(project.id, outsider.id)).toBeUndefined();
	});

	it("allows only the owner to update project details", async () => {
		const owner = await createTestUser("update-owner");
		const member = await createTestUser("update-member");
		const project = await createTestProject(owner.id, "Update");

		await addTestProjectMember(project.id, member.id, "member");

		const memberUpdate = await updateProjectForUser(project.id, member.id, {
			name: "Member edit",
			description: null,
			color: "cyan",
			startDate: null,
			dueDate: null,
		});

		expect(memberUpdate).toBeUndefined();

		const ownerUpdate = await updateProjectForUser(project.id, owner.id, {
			name: "Owner edit",
			description: "Updated",
			color: "violet",
			startDate: null,
			dueDate: null,
		});

		expect(ownerUpdate).toMatchObject({
			id: project.id,
			name: "Owner edit",
			color: "violet",
		});
	});

	it("allows only the owner to complete and delete projects", async () => {
		const owner = await createTestUser("governance-owner");
		const member = await createTestUser("governance-member");
		const project = await createTestProject(owner.id, "Governance");

		await addTestProjectMember(project.id, member.id, "member");

		expect(
			await setProjectCompletedForUser(project.id, member.id, true),
		).toBeUndefined();

		const completed = await setProjectCompletedForUser(
			project.id,
			owner.id,
			true,
		);

		expect(completed?.completedAt).toBeInstanceOf(Date);

		expect(await deleteProjectForUser(project.id, member.id)).toBeUndefined();
		expect(await deleteProjectForUser(project.id, owner.id)).toBe(project.id);
	});
});
