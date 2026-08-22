export const PROJECT_ACTIVITY_ACTION_VALUES = [
	"project_created",
	"project_updated",
	"project_completed",
	"project_reactivated",
	"stage_created",
	"stage_renamed",
	"stage_deleted",
	"stage_reordered",
	"member_added",
	"member_role_updated",
	"member_removed",
	"label_created",
	"label_updated",
	"label_deleted",
] as const;

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

export const ACTIVITY_ACTION_VALUES = [
	...PROJECT_ACTIVITY_ACTION_VALUES,
	...TASK_ACTIVITY_ACTION_VALUES,
] as const;

export type ActivityAction = (typeof ACTIVITY_ACTION_VALUES)[number];

export type TaskActivityAction = (typeof TASK_ACTIVITY_ACTION_VALUES)[number];

export type ActivityMetadata = {
	projectName?: string;
	taskTitle?: string;
	stageName?: string;
	previousStageName?: string;
	fromStage?: string;
	toStage?: string;
	changedFields?: string;
	assigneeName?: string;
	labelName?: string;
	previousLabelName?: string;
	memberName?: string;
	memberRole?: string;
	previousMemberRole?: string;
};

export type TaskActivityMetadata = ActivityMetadata & {
	taskTitle: string;
};
