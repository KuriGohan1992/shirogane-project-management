import type { ProjectAccessRole } from "@/lib/auth/project-permissions";
import type { ColorValue } from "@/lib/constants/colors";
import type { UserSummary } from "@/types/user";

export type TeamSharedProject = {
	id: string;
	name: string;
	color: ColorValue;
	completedAt: Date | null;
	lastActivityAt: Date;
	role: ProjectAccessRole;
};

export type TeamCollaborator = UserSummary & {
	projects: TeamSharedProject[];
};

export type TeamProjectFilterOption = {
	id: string;
	name: string;
	color: ColorValue;
};

export type TeamDirectoryData = {
	collaborators: TeamCollaborator[];
	projects: TeamProjectFilterOption[];
};
