import { z } from "zod";

import { TASK_FIELD_LIMITS } from "@/lib/constants/form-limits";
import {
	optionalDateValueSchema,
	uuidV4Schema,
} from "@/lib/validations/common";

export const taskFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Task title is required.")
		.max(
			TASK_FIELD_LIMITS.title,
			`Task title must be ${TASK_FIELD_LIMITS.title} characters or fewer.`,
		),

	description: z
		.string()
		.trim()
		.max(
			TASK_FIELD_LIMITS.description,
			`Description must be ${TASK_FIELD_LIMITS.description} characters or fewer.`,
		),

	priority: z.enum(["low", "medium", "high", "urgent"]),

	dueDate: optionalDateValueSchema,
});

export const taskIdSchema = uuidV4Schema;

export const taskSlugSchema = z
	.string()
	.min(1)
	.max(81)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "The task link is invalid.");

export type TaskFormData = z.infer<typeof taskFormSchema>;
