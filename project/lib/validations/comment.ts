import { z } from "zod";

import { COMMENT_FIELD_LIMITS } from "@/lib/constants/form-limits";
import { uuidV4Schema } from "@/lib/validations/common";

export const commentFormSchema = z.object({
	content: z
		.string()
		.trim()
		.min(1, "Comment is required.")
		.max(
			COMMENT_FIELD_LIMITS.content,
			`Comment must be ${COMMENT_FIELD_LIMITS.content} characters or fewer.`,
		),
});

export const commentIdSchema = uuidV4Schema;

export type CommentFormData = z.infer<typeof commentFormSchema>;
