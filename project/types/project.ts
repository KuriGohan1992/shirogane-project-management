import type { ProjectAccessRole } from "@/lib/auth/project-permissions";
import type { Project } from "@/lib/db/schema";
import type { ProjectFormData } from "@/lib/validations/project";

export type ProjectActionState = {
	success: boolean;
	message?: string;
	errors?: {
		name?: string[];
		description?: string[];
		color?: string[];
		startDate?: string[];
		dueDate?: string[];
	};
};

export type EditableProject = ProjectFormData & {
	id: string;
};

export type ProjectWithAccess = Project & {
	accessRole: ProjectAccessRole;
};
