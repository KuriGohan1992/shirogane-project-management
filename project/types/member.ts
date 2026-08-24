import type { ProjectMember } from "@/lib/db/schema";
import type { UserProfileSummary } from "@/types/user";

export type ProjectMemberActionState = {
	success: boolean;
	message?: string;
	errors?: {
		email?: string[];
	};
};

export type ProjectMemberWithUser = ProjectMember & {
	user: UserProfileSummary;
};

export type AssignmentCandidate = UserProfileSummary & {
	isOwner: boolean;
	source: "project" | "team";
	needsProjectMembership: boolean;
};
