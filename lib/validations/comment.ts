import { z } from "zod";

import { COMMENT_FIELD_LIMITS } from "@/lib/constants/form-limits";
import { uuidV4Schema } from "@/lib/validations/common";

const commentContentSchema = z.preprocess(
	(value) =>
		typeof value === "string" ? value.replace(/\r\n?/g, "\n") : value,
	z
		.string()
		.trim()
		.min(1, "Comment is required.")
		.max(
			COMMENT_FIELD_LIMITS.content,
			`Comment must be ${COMMENT_FIELD_LIMITS.content} characters or fewer.`,
		),
);

export const commentFormSchema = z.object({
	content: commentContentSchema,
});

export const commentIdSchema = uuidV4Schema;

export type CommentFormData = z.infer<typeof commentFormSchema>;
