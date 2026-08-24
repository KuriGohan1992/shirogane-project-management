import { describe, expect, it } from "vitest";

import { getTaskHref, slugifyTaskTitle } from "@/lib/task-route";

describe("task routes", () => {
	it("creates readable lowercase slugs", () => {
		expect(slugifyTaskTitle("Fix Landing Page Polish")).toBe(
			"fix-landing-page-polish",
		);
	});

	it("normalizes accents and punctuation", () => {
		expect(slugifyTaskTitle("Résumé: QA & Review!")).toBe("resume-qa-review");
	});

	it("falls back to task when the title has no slug characters", () => {
		expect(slugifyTaskTitle("✨✨✨")).toBe("task");
	});

	it("truncates long slugs without leaving a trailing hyphen", () => {
		const slug = slugifyTaskTitle(`${"word-".repeat(30)}ending`);

		expect(slug.length).toBeLessThanOrEqual(72);
		expect(slug.endsWith("-")).toBe(false);
	});

	it("builds the canonical task URL", () => {
		expect(getTaskHref("project-1", "task-1", "Ship MVP")).toBe(
			"/projects/project-1/tasks/task-1/ship-mvp",
		);
	});
});
