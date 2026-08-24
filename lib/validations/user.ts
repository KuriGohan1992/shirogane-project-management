import { z } from "zod";

import { NOTIFICATION_CATEGORY_VALUES } from "@/lib/constants/notifications";
import { uuidV4Schema } from "@/lib/validations/common";

export const userIdSchema = uuidV4Schema;

export const profileSettingsSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(1, "First name is required.")
		.max(50, "First name must be 50 characters or fewer."),

	lastName: z
		.string()
		.trim()
		.max(50, "Last name must be 50 characters or fewer."),

	jobTitle: z
		.string()
		.trim()
		.max(60, "Job title must be 60 characters or fewer.")
		.transform((value) => value || null),
});

export const notificationPreferencesSchema = z.object({
	notificationsMuted: z.boolean(),

	mutedCategories: z
		.array(z.enum(NOTIFICATION_CATEGORY_VALUES))
		.max(NOTIFICATION_CATEGORY_VALUES.length)
		.transform((categories) => [...new Set(categories)]),
});
