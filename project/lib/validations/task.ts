import { z } from "zod";

import { TASK_FIELD_LIMITS } from "@/lib/constants/form-limits";
import {
	optionalDateValueSchema,
	uuidV4Schema,
} from "@/lib/validations/common";

const taskDescriptionSchema = z.preprocess(
	(value) =>
		typeof value === "string" ? value.replace(/\r\n?/g, "\n") : value,
	z
		.string()
		.trim()
		.max(
			TASK_FIELD_LIMITS.description,
			`Description must be ${TASK_FIELD_LIMITS.description} characters or fewer.`,
		),
);

const taskPrioritySchema = z.preprocess(
	(value) => (value === "" || value === null ? null : value),
	z.enum(["low", "medium", "high", "urgent"]).nullable(),
);

export const taskFormSchema = z
	.object({
		title: z
			.string()
			.trim()
			.min(1, "Task title is required.")
			.max(
				TASK_FIELD_LIMITS.title,
				`Task title must be ${TASK_FIELD_LIMITS.title} characters or fewer.`,
			),

		description: taskDescriptionSchema,

		priority: taskPrioritySchema,

		startDate: optionalDateValueSchema,

		dueDate: optionalDateValueSchema,
	})
	.superRefine((data, context) => {
		if (!data.startDate || !data.dueDate) {
			return;
		}

		if (data.startDate <= data.dueDate) {
			return;
		}

		context.addIssue({
			code: "custom",
			path: ["dueDate"],
			message: "Due date cannot be before the start date.",
		});
	});

export const taskIdSchema = uuidV4Schema;

export const taskSlugSchema = z
	.string()
	.min(1)
	.max(81)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "The task link is invalid.");

export type TaskFormData = z.infer<typeof taskFormSchema>;
