import type { Stage } from "@/lib/db/schema";
import type { StageFormData } from "@/lib/validations/stage";
import type { TaskWithDetails } from "@/types/task";

export type StageActionState = {
	success: boolean;
	message?: string;
	errors?: {
		name?: string[];
	};
};

export type EditableStage = StageFormData & {
	id: string;
};

export type StageWithTasks = Stage & {
	tasks: TaskWithDetails[];
};
