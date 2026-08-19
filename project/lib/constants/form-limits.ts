export const PROJECT_FIELD_LIMITS = {
	name: 100,
	description: 500,
} as const;

export const TASK_FIELD_LIMITS = {
	title: 200,
	description: 2000,
} as const;

export const STAGE_FIELD_LIMITS = {
	name: 100,
} as const;

export const COMMENT_FIELD_LIMITS = {
	content: 1000,
} as const;
