import type { Stage, Task } from "@/lib/db/schema";
import type { TaskFormData } from "@/lib/validations/task";

export type TaskActionState = {
	success: boolean;
	message?: string;
	errors?: {
		title?: string[];
		description?: string[];
		priority?: string[];
		dueDate?: string[];
	};
};

export type EditableTask = TaskFormData & {
	id: string;
};

export type StageWithTasks = Stage & {
	tasks: Task[];
};
