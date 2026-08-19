import type { ProjectLabel, TaskLabel } from "@/lib/db/schema";

export type LabelActionState = {
	success: boolean;
	message?: string;
	errors?: {
		name?: string[];
		color?: string[];
	};
};

export type TaskLabelWithLabel = TaskLabel & {
	label: ProjectLabel;
};
