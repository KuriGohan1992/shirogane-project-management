import { describe, expect, it } from "vitest";

import { buildAssignmentCandidates } from "@/lib/assignment-candidates";
import type { ProjectMemberWithUser } from "@/types/member";
import type { UserProfileSummary } from "@/types/user";

const owner: UserProfileSummary = {
	id: "owner",
	name: "Owner",
	email: "owner@shiro.test",
	imageUrl: null,
	jobTitle: "Project Lead",
};

const memberUser: UserProfileSummary = {
	id: "member",
	name: "Member",
	email: "member@shiro.test",
	imageUrl: null,
	jobTitle: null,
};

const viewerUser: UserProfileSummary = {
	id: "viewer",
	name: "Viewer",
	email: "viewer@shiro.test",
	imageUrl: null,
	jobTitle: null,
};

const teamUser: UserProfileSummary = {
	id: "team",
	name: "Team User",
	email: "team@shiro.test",
	imageUrl: null,
	jobTitle: "Engineer",
};

function membership(
	user: UserProfileSummary,
	role: "member" | "viewer",
): ProjectMemberWithUser {
	return {
		projectId: "project",
		userId: user.id,
		role,
		joinedAt: new Date("2026-08-01T00:00:00.000Z"),
		user,
	};
}

describe("buildAssignmentCandidates", () => {
	it("always includes the project owner", () => {
		const candidates = buildAssignmentCandidates({
			owner,
			members: [],
			teamCollaborators: [],
			canManageMembers: false,
		});

		expect(candidates).toEqual([
			expect.objectContaining({
				id: owner.id,
				isOwner: true,
				source: "project",
				needsProjectMembership: false,
			}),
		]);
	});

	it("includes members but excludes viewers from assignment", () => {
		const candidates = buildAssignmentCandidates({
			owner,
			members: [
				membership(memberUser, "member"),
				membership(viewerUser, "viewer"),
			],
			teamCollaborators: [],
			canManageMembers: false,
		});

		expect(candidates.map((candidate) => candidate.id)).toEqual([
			"owner",
			"member",
		]);
	});

	it("lets owners pull eligible collaborators from the wider team", () => {
		const candidates = buildAssignmentCandidates({
			owner,
			members: [membership(memberUser, "member")],
			teamCollaborators: [memberUser, teamUser],
			canManageMembers: true,
		});

		expect(candidates).toContainEqual(
			expect.objectContaining({
				id: "team",
				source: "team",
				needsProjectMembership: true,
			}),
		);

		expect(
			candidates.filter((candidate) => candidate.id === "member"),
		).toHaveLength(1);
	});

	it("does not expose wider-team candidates when members cannot be managed", () => {
		const candidates = buildAssignmentCandidates({
			owner,
			members: [],
			teamCollaborators: [teamUser],
			canManageMembers: false,
		});

		expect(candidates.map((candidate) => candidate.id)).toEqual(["owner"]);
	});
});
