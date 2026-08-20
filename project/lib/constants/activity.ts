export const TASK_ACTIVITY_ACTION_VALUES = [
	"task_created",
	"task_updated",
	"task_moved",
	"task_archived",
	"task_restored",
	"task_deleted",
	"assignee_added",
	"assignee_removed",
	"label_added",
	"label_removed",
	"comment_added",
] as const;

export type TaskActivityAction = (typeof TASK_ACTIVITY_ACTION_VALUES)[number];

export type TaskActivityMetadata = {
	taskTitle: string;
	stageName?: string;
	fromStage?: string;
	toStage?: string;
	changedFields?: string;
	assigneeName?: string;
	labelName?: string;
};
