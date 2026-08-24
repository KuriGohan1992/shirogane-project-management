import { z } from "zod";

import { STAGE_FIELD_LIMITS } from "@/lib/constants/form-limits";
import { uuidV4Schema } from "@/lib/validations/common";

export const stageFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Stage name is required.")
		.max(
			STAGE_FIELD_LIMITS.name,
			`Stage name must be ${STAGE_FIELD_LIMITS.name} characters or fewer.`,
		),
});

export const stageIdSchema = uuidV4Schema;

export type StageFormData = z.infer<typeof stageFormSchema>;
