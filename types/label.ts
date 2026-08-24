import type { ProjectLabel, TaskLabel } from "@/lib/db/schema";

export type LabelOption = Pick<ProjectLabel, "id" | "name" | "color">;

export type LabelActionState = {
	success: boolean;
	message?: string;
	label?: LabelOption;
	errors?: {
		name?: string[];
		color?: string[];
	};
};

export type TaskLabelWithLabel = TaskLabel & {
	label: ProjectLabel;
};
