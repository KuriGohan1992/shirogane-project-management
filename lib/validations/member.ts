import { z } from "zod";
import { PROJECT_MEMBER_ROLE_VALUES } from "../constants/project-roles";

export const projectMemberFormSchema = z.object({
	email: z.preprocess(
		(value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
		z.email({
			error: "Enter a valid email address.",
		}),
	),
});

export const projectMemberRoleSchema = z.enum(PROJECT_MEMBER_ROLE_VALUES);
