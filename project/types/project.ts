import type { ProjectFormData } from "@/lib/validations/project";

export type ProjectActionState = {
	success: boolean;
	message?: string;
	errors?: {
		name?: string[];
		description?: string[];
		dueDate?: string[];
	};
};

export type EditableProject = ProjectFormData & {
	id: string;
};
