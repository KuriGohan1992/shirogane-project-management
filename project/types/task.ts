import type { Task, TaskAssignee } from "@/lib/db/schema";
import type { TaskFormData } from "@/lib/validations/task";
import type { TaskCommentWithAuthor } from "@/types/comment";
import type { UserSummary } from "@/types/user";

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

export type TaskAssigneeWithUser = TaskAssignee & {
	user: UserSummary;
};

export type TaskWithAssignees = Task & {
	assignees: TaskAssigneeWithUser[];
};

export type TaskWithDetails = TaskWithAssignees & {
	comments: TaskCommentWithAuthor[];
};
