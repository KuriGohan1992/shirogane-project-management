import { z } from "zod";

import {
	optionalDateValueSchema,
	uuidV4Schema,
} from "@/lib/validations/common";
import { PROJECT_FIELD_LIMITS } from "../constants/form-limits";

export const projectFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Project name is required.")
		.max(
			PROJECT_FIELD_LIMITS.name,
			`Project name must be ${PROJECT_FIELD_LIMITS.name} characters or fewer.`,
		),

	description: z
		.string()
		.trim()
		.max(
			PROJECT_FIELD_LIMITS.description,
			`Description must be ${PROJECT_FIELD_LIMITS.description} characters or fewer.`,
		),

	dueDate: optionalDateValueSchema,
});

export const projectIdSchema = uuidV4Schema;

export type ProjectFormData = z.infer<typeof projectFormSchema>;
