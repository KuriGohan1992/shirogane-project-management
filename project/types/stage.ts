import type { Stage, Task } from "@/lib/db/schema";
import type { StageFormData } from "@/lib/validations/stage";

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
	tasks: Task[];
};
