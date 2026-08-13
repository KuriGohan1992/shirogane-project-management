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

export const optionalDateValueSchema = z
	.string()
	.trim()
	.refine(isValidDateValue, "Enter a valid due date.");

export const uuidV4Schema = z.uuidv4();
