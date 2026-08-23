import type { ProjectMember } from "@/lib/db/schema";
import type { UserProfileSummary, UserSummary } from "@/types/user";

export type ProjectMemberActionState = {
	success: boolean;
	message?: string;
	errors?: {
		email?: string[];
	};
};

export type ProjectMemberWithUser = ProjectMember & {
	user: UserSummary;
};

export type AssignmentCandidate = UserProfileSummary & {
	isOwner: boolean;
};
