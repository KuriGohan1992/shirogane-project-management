export const PROJECT_MEMBER_ROLE_VALUES = ["member", "viewer"] as const;

export type ProjectMemberRoleValue =
	(typeof PROJECT_MEMBER_ROLE_VALUES)[number];

export const PROJECT_MEMBER_ROLE_LABELS: Record<
	ProjectMemberRoleValue,
	string
> = {
	member: "Member",
	viewer: "Viewer",
};
