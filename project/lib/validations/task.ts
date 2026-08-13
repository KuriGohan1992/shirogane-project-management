import { z } from "zod";

import {
	optionalDateValueSchema,
	uuidV4Schema,
} from "@/lib/validations/common";
import { TASK_FIELD_LIMITS } from "../constants/form-limits";

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
export const stageIdSchema = uuidV4Schema;

export type TaskFormData = z.infer<typeof taskFormSchema>;
