import type {
	AssignmentCandidate,
	ProjectMemberWithUser,
} from "@/types/member";
import type { UserProfileSummary } from "@/types/user";

type AssignmentCandidateInput = {
	owner: UserProfileSummary;
	members: ProjectMemberWithUser[];
	teamCollaborators: UserProfileSummary[];
	canManageMembers: boolean;
};

export function buildAssignmentCandidates({
	owner,
	members,
	teamCollaborators,
	canManageMembers,
}: AssignmentCandidateInput): AssignmentCandidate[] {
	const candidates: AssignmentCandidate[] = [
		{
			...owner,
			isOwner: true,
			source: "project",
			needsProjectMembership: false,
		},
	];

	const existingProjectUserIds = new Set<string>([
		owner.id,
		...members.map((member) => member.userId),
	]);

	for (const member of members) {
		if (member.role !== "member") {
			continue;
		}

		candidates.push({
			...member.user,
			isOwner: false,
			source: "project",
			needsProjectMembership: false,
		});
	}

	if (canManageMembers) {
		for (const collaborator of teamCollaborators) {
			if (existingProjectUserIds.has(collaborator.id)) {
				continue;
			}

			candidates.push({
				...collaborator,
				isOwner: false,
				source: "team",
				needsProjectMembership: true,
			});
		}
	}

	return candidates;
}
