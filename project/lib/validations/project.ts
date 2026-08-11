import { z } from "zod";

const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateValue(value: string) {
	if (value === "") {
		return true;
	}

	if (!DATE_VALUE_PATTERN.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00.000Z`);

	return (
		!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
	);
}

export const projectFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Project name is required.")
		.max(100, "Project name must be 100 characters or fewer."),

	description: z
		.string()
		.trim()
		.max(500, "Description must be 500 characters or fewer."),

	dueDate: z
		.string()
		.trim()
		.refine(isValidDateValue, "Enter a valid due date."),
});

export const projectIdSchema = z.uuidv4();

export type ProjectFormData = z.infer<typeof projectFormSchema>;
