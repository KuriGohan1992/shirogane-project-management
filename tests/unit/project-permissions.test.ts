import { describe, expect, it } from "vitest";

import { getProjectPermissions } from "@/lib/auth/project-permissions";

describe("getProjectPermissions", () => {
	it("gives owners every project capability", () => {
		expect(getProjectPermissions("owner")).toEqual({
			canEditProject: true,
			canDeleteProject: true,
			canCompleteProject: true,
			canManageMembers: true,
			canManageStages: true,
			canManageTasks: true,
			canAssignTasks: true,
		});
	});

	it("lets members manage board work but not project administration", () => {
		expect(getProjectPermissions("member")).toEqual({
			canEditProject: false,
			canDeleteProject: false,
			canCompleteProject: false,
			canManageMembers: false,
			canManageStages: true,
			canManageTasks: true,
			canAssignTasks: true,
		});
	});

	it("keeps viewers read-only", () => {
		expect(getProjectPermissions("viewer")).toEqual({
			canEditProject: false,
			canDeleteProject: false,
			canCompleteProject: false,
			canManageMembers: false,
			canManageStages: false,
			canManageTasks: false,
			canAssignTasks: false,
		});
	});
});
