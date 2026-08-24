import { describe, expect, it } from "vitest";

import {
	COMMENT_FIELD_LIMITS,
	LABEL_FIELD_LIMITS,
	PROJECT_FIELD_LIMITS,
	STAGE_FIELD_LIMITS,
	TASK_FIELD_LIMITS,
} from "@/lib/constants/form-limits";
import { commentFormSchema } from "@/lib/validations/comment";
import {
	optionalDateValueSchema,
	uuidV4Schema,
} from "@/lib/validations/common";
import { labelFormSchema } from "@/lib/validations/label";
import {
	projectMemberFormSchema,
	projectMemberRoleSchema,
} from "@/lib/validations/member";
import { projectFormSchema } from "@/lib/validations/project";
import { stageFormSchema } from "@/lib/validations/stage";
import { taskFormSchema, taskSlugSchema } from "@/lib/validations/task";
import {
	notificationPreferencesSchema,
	profileSettingsSchema,
} from "@/lib/validations/user";

describe("common validation", () => {
	it("accepts empty or real date-only values", () => {
		expect(optionalDateValueSchema.safeParse("").success).toBe(true);
		expect(optionalDateValueSchema.safeParse("2026-02-28").success).toBe(true);
	});

	it("rejects impossible and malformed dates", () => {
		expect(optionalDateValueSchema.safeParse("2026-02-30").success).toBe(false);
		expect(optionalDateValueSchema.safeParse("02/28/2026").success).toBe(false);
	});

	it("accepts UUID v4 values only", () => {
		expect(
			uuidV4Schema.safeParse("a3bb189e-8bf9-4f2d-bf6a-0f4fdbbb83cc").success,
		).toBe(true);
		expect(uuidV4Schema.safeParse("not-a-uuid").success).toBe(false);
	});
});

describe("project validation", () => {
	const valid = {
		name: "Shiro",
		description: "Project management",
		color: "blue",
		startDate: "2026-08-01",
		dueDate: "2026-08-31",
	};

	it("trims input and normalizes line endings", () => {
		const result = projectFormSchema.parse({
			...valid,
			name: "  Shiro  ",
			description: "Line one\r\nLine two\rLine three",
		});

		expect(result.name).toBe("Shiro");
		expect(result.description).toBe("Line one\nLine two\nLine three");
	});

	it("rejects due dates before the start date", () => {
		const result = projectFormSchema.safeParse({
			...valid,
			startDate: "2026-09-01",
			dueDate: "2026-08-31",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.dueDate).toContain(
				"Due date cannot be before the start date.",
			);
		}
	});

	it("enforces project field limits", () => {
		expect(
			projectFormSchema.safeParse({
				...valid,
				name: "x".repeat(PROJECT_FIELD_LIMITS.name + 1),
			}).success,
		).toBe(false);

		expect(
			projectFormSchema.safeParse({
				...valid,
				description: "x".repeat(PROJECT_FIELD_LIMITS.description + 1),
			}).success,
		).toBe(false);
	});
});

describe("task validation", () => {
	const valid = {
		title: "Ship capstone",
		description: "",
		priority: "high",
		startDate: "",
		dueDate: "",
	};

	it("converts empty priorities to null", () => {
		expect(
			taskFormSchema.parse({ ...valid, priority: "" }).priority,
		).toBeNull();
	});

	it("rejects invalid priorities", () => {
		expect(
			taskFormSchema.safeParse({ ...valid, priority: "critical" }).success,
		).toBe(false);
	});

	it("rejects due dates before start dates", () => {
		const result = taskFormSchema.safeParse({
			...valid,
			startDate: "2026-08-20",
			dueDate: "2026-08-19",
		});

		expect(result.success).toBe(false);
	});

	it("enforces task field limits", () => {
		expect(
			taskFormSchema.safeParse({
				...valid,
				title: "x".repeat(TASK_FIELD_LIMITS.title + 1),
			}).success,
		).toBe(false);

		expect(
			taskFormSchema.safeParse({
				...valid,
				description: "x".repeat(TASK_FIELD_LIMITS.description + 1),
			}).success,
		).toBe(false);
	});

	it("accepts canonical task slugs only", () => {
		expect(taskSlugSchema.safeParse("ship-capstone").success).toBe(true);
		expect(taskSlugSchema.safeParse("Ship Capstone").success).toBe(false);
		expect(taskSlugSchema.safeParse("bad--slug").success).toBe(false);
	});
});

describe("stage, label, comment, and member validation", () => {
	it("enforces stage and label limits", () => {
		expect(stageFormSchema.safeParse({ name: "Backlog" }).success).toBe(true);
		expect(
			stageFormSchema.safeParse({
				name: "x".repeat(STAGE_FIELD_LIMITS.name + 1),
			}).success,
		).toBe(false);

		expect(
			labelFormSchema.safeParse({ name: "Frontend", color: "cyan" }).success,
		).toBe(true);
		expect(
			labelFormSchema.safeParse({
				name: "x".repeat(LABEL_FIELD_LIMITS.name + 1),
				color: "cyan",
			}).success,
		).toBe(false);
	});

	it("normalizes comment line endings and rejects blank comments", () => {
		expect(commentFormSchema.parse({ content: "One\r\nTwo" }).content).toBe(
			"One\nTwo",
		);

		expect(commentFormSchema.safeParse({ content: "   " }).success).toBe(false);
		expect(
			commentFormSchema.safeParse({
				content: "x".repeat(COMMENT_FIELD_LIMITS.content + 1),
			}).success,
		).toBe(false);
	});

	it("normalizes collaborator emails and restricts roles", () => {
		expect(
			projectMemberFormSchema.parse({ email: "  PERSON@Example.COM " }).email,
		).toBe("person@example.com");

		expect(projectMemberRoleSchema.safeParse("member").success).toBe(true);
		expect(projectMemberRoleSchema.safeParse("viewer").success).toBe(true);
		expect(projectMemberRoleSchema.safeParse("owner").success).toBe(false);
	});
});

describe("user settings validation", () => {
	it("normalizes blank job titles to null", () => {
		expect(
			profileSettingsSchema.parse({
				firstName: "Cham",
				lastName: "Mendez",
				jobTitle: "   ",
			}).jobTitle,
		).toBeNull();
	});

	it("deduplicates muted notification categories", () => {
		expect(
			notificationPreferencesSchema.parse({
				notificationsMuted: false,
				mutedCategories: ["comments", "comments", "deadlines"],
			}).mutedCategories,
		).toEqual(["comments", "deadlines"]);
	});
});
