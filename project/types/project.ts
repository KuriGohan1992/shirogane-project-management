export type ProjectActionState = {
	success: boolean;
	message?: string;
	errors?: {
		name?: string[];
		description?: string[];
		dueDate?: string[];
	};
};

export type ProjectFormValues = {
	name: string;
	description: string;
	dueDate: string;
};

export type EditableProject = ProjectFormValues & {
	id: string;
};
