import { z } from "zod";

import { COLOR_VALUES } from "@/lib/constants/colors";
import { LABEL_FIELD_LIMITS } from "@/lib/constants/form-limits";
import { uuidV4Schema } from "@/lib/validations/common";

export const labelFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Label name is required.")
		.max(
			LABEL_FIELD_LIMITS.name,
			`Label name must be ${LABEL_FIELD_LIMITS.name} characters or fewer.`,
		),

	color: z.enum(COLOR_VALUES),
});

export const labelIdSchema = uuidV4Schema;

export type LabelFormData = z.infer<typeof labelFormSchema>;
