export const PROJECT_FIELD_LIMITS = {
	name: 35,
	description: 500,
} as const;

export const TASK_FIELD_LIMITS = {
	title: 40,
	description: 1000,
} as const;

export const STAGE_FIELD_LIMITS = {
	name: 20,
} as const;

export const COMMENT_FIELD_LIMITS = {
	content: 1000,
} as const;

export const LABEL_FIELD_LIMITS = {
	name: 15,
} as const;
