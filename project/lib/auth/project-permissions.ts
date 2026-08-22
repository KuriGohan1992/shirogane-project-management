import type { ProjectMemberRoleValue } from "@/lib/constants/project-roles";

export type ProjectAccessRole = "owner" | ProjectMemberRoleValue;

export type ProjectPermissions = {
	canEditProject: boolean;
	canDeleteProject: boolean;
	canCompleteProject: boolean;
	canManageMembers: boolean;
	canManageStages: boolean;
	canManageTasks: boolean;
	canAssignTasks: boolean;
};

const OWNER_PERMISSIONS: ProjectPermissions = {
	canEditProject: true,
	canDeleteProject: true,
	canCompleteProject: true,
	canManageMembers: true,
	canManageStages: true,
	canManageTasks: true,
	canAssignTasks: true,
};

const MEMBER_PERMISSIONS: ProjectPermissions = {
	canEditProject: false,
	canDeleteProject: false,
	canCompleteProject: false,
	canManageMembers: false,
	canManageStages: true,
	canManageTasks: true,
	canAssignTasks: true,
};

const VIEWER_PERMISSIONS: ProjectPermissions = {
	canEditProject: false,
	canDeleteProject: false,
	canCompleteProject: false,
	canManageMembers: false,
	canManageStages: false,
	canManageTasks: false,
	canAssignTasks: false,
};

export function getProjectPermissions(
	role: ProjectAccessRole,
): ProjectPermissions {
	switch (role) {
		case "owner":
			return OWNER_PERMISSIONS;

		case "member":
			return MEMBER_PERMISSIONS;

		case "viewer":
			return VIEWER_PERMISSIONS;
	}
}
