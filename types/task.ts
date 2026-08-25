import type { Task, TaskAssignee, TaskComment } from "@/lib/db/schema";
import type { TaskFormData } from "@/lib/validations/task";
import type { TaskActivityWithActor } from "@/types/activity";
import type { TaskCommentWithAuthor } from "@/types/comment";
import type { TaskLabelWithLabel } from "@/types/label";
import type { UserSummary } from "@/types/user";

export type TaskActionState = {
	success: boolean;
	message?: string;
	errors?: {
		title?: string[];
		description?: string[];
		priority?: string[];
		startDate?: string[];
		dueDate?: string[];
	};
};

export type EditableTask = TaskFormData & {
	id: string;
};

export type ArchivedTaskSummary = Pick<
	Task,
	"id" | "title" | "priority" | "completedAt"
> & {
	stageName: string;
	archivedAt: Date;
};

export type TaskAssigneeWithUser = TaskAssignee & {
	user: UserSummary;
};

export type TaskWithAssignees = Task & {
	assignees: TaskAssigneeWithUser[];
};

export type TaskWithBoardDetails = TaskWithAssignees & {
	labels: TaskLabelWithLabel[];
	comments: Pick<TaskComment, "id">[];
};

export type TaskWithDetails = TaskWithAssignees & {
	labels: TaskLabelWithLabel[];
	comments: TaskCommentWithAuthor[];
	activities: TaskActivityWithActor[];
};
