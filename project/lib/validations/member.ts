import { z } from "zod";

export const projectMemberFormSchema = z.object({
	email: z.preprocess(
		(value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
		z.email({
			error: "Enter a valid email address.",
		}),
	),
});
