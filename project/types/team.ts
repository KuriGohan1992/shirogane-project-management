import type { ProjectAccessRole } from "@/lib/auth/project-permissions";
import type { Project, ProjectMember, Task } from "@/lib/db/schema";
import type { UserProfileSummary } from "@/types/user";

export type TeamAssignedTask = Pick<Task, "id" | "title"> & {
	stageName: string;
};

export type TeamSharedProject = Pick<
	Project,
	"id" | "name" | "color" | "completedAt"
> & {
	role: ProjectMember["role"] | "owner";

	lastActivityAt: Date;

	tasks: TeamAssignedTask[];
	canRemoveMember: boolean;
	yourRole: ProjectAccessRole;
};

export type TeamCollaborator = UserProfileSummary & {
	projects: TeamSharedProject[];
};

export type TeamProjectOption = Pick<Project, "id" | "name" | "color">;

export type TeamDirectoryData = {
	collaborators: TeamCollaborator[];
	projects: TeamProjectOption[];
};
