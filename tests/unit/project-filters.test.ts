import { describe, expect, it } from "vitest";

import {
	getDefaultProjectSortDirection,
	matchesProjectScheduleFilter,
	matchesProjectStatusFilter,
	parseProjectAccessFilter,
	parseProjectColorFilter,
	parseProjectScheduleFilter,
	parseProjectSortDirection,
	parseProjectSortOption,
	parseProjectStatusFilter,
	sortProjects,
} from "@/lib/project-filters";
import type { ProjectWithAccess } from "@/types/project";

function makeProject(
	overrides: Partial<ProjectWithAccess> = {},
): ProjectWithAccess {
	return {
		id: "project",
		ownerId: "owner",
		name: "Project",
		description: null,
		color: "cyan",
		startDate: null,
		dueDate: null,
		completedAt: null,
		createdAt: new Date("2026-08-01T00:00:00.000Z"),
		updatedAt: new Date("2026-08-01T00:00:00.000Z"),
		owner: {
			id: "owner",
			name: "Owner",
			email: "owner@shiro.test",
			imageUrl: null,
			jobTitle: null,
		},
		accessRole: "owner",
		lastActivityAt: new Date("2026-08-01T00:00:00.000Z"),
		...overrides,
	};
}

describe("project filter parsing", () => {
	it("accepts valid values", () => {
		expect(parseProjectAccessFilter("member")).toBe("member");
		expect(parseProjectColorFilter("violet")).toBe("violet");
		expect(parseProjectStatusFilter("completed")).toBe("completed");
		expect(parseProjectScheduleFilter("overdue")).toBe("overdue");
		expect(parseProjectSortOption("name")).toBe("name");
		expect(parseProjectSortDirection("desc", "name")).toBe("desc");
	});

	it("falls back for invalid values", () => {
		expect(parseProjectAccessFilter("admin")).toBe("all");
		expect(parseProjectColorFilter("magenta")).toBe("all");
		expect(parseProjectStatusFilter("archived")).toBe("all");
		expect(parseProjectScheduleFilter("tomorrow")).toBe("all");
		expect(parseProjectSortOption("random")).toBe("last-activity");
		expect(parseProjectSortDirection("sideways", "due-date")).toBe("asc");
	});

	it("uses the intended default sort directions", () => {
		expect(getDefaultProjectSortDirection("last-activity")).toBe("desc");
		expect(getDefaultProjectSortDirection("date-created")).toBe("desc");
		expect(getDefaultProjectSortDirection("due-date")).toBe("asc");
		expect(getDefaultProjectSortDirection("name")).toBe("asc");
		expect(getDefaultProjectSortDirection("color")).toBe("asc");
	});
});

describe("project schedule and status matching", () => {
	const today = Date.UTC(2026, 7, 25);

	it("matches projects without dates", () => {
		expect(
			matchesProjectScheduleFilter(
				makeProject({ startDate: null, dueDate: null }),
				"no-dates",
				today,
			),
		).toBe(true);

		expect(
			matchesProjectScheduleFilter(
				makeProject({ startDate: new Date("2026-08-20T00:00:00.000Z") }),
				"no-dates",
				today,
			),
		).toBe(false);
	});

	it("treats dates before today as overdue", () => {
		expect(
			matchesProjectScheduleFilter(
				makeProject({ dueDate: new Date("2026-08-24T00:00:00.000Z") }),
				"overdue",
				today,
			),
		).toBe(true);

		expect(
			matchesProjectScheduleFilter(
				makeProject({ dueDate: new Date("2026-08-25T00:00:00.000Z") }),
				"overdue",
				today,
			),
		).toBe(false);
	});

	it("includes today through seven days from today", () => {
		expect(
			matchesProjectScheduleFilter(
				makeProject({ dueDate: new Date("2026-08-25T00:00:00.000Z") }),
				"due-next-7-days",
				today,
			),
		).toBe(true);

		expect(
			matchesProjectScheduleFilter(
				makeProject({ dueDate: new Date("2026-09-01T00:00:00.000Z") }),
				"due-next-7-days",
				today,
			),
		).toBe(true);

		expect(
			matchesProjectScheduleFilter(
				makeProject({ dueDate: new Date("2026-09-02T00:00:00.000Z") }),
				"due-next-7-days",
				today,
			),
		).toBe(false);
	});

	it("distinguishes active and completed projects", () => {
		expect(matchesProjectStatusFilter(makeProject(), "active")).toBe(true);
		expect(
			matchesProjectStatusFilter(
				makeProject({ completedAt: new Date("2026-08-20T00:00:00.000Z") }),
				"completed",
			),
		).toBe(true);
	});
});

describe("sortProjects", () => {
	it("sorts names case-insensitively", () => {
		const projects = [
			makeProject({ id: "b", name: "beta" }),
			makeProject({ id: "a", name: "Alpha" }),
		];

		expect(
			sortProjects(projects, "name", "asc").map((project) => project.id),
		).toEqual(["a", "b"]);
	});

	it("keeps projects without due dates after dated projects", () => {
		const projects = [
			makeProject({ id: "none", name: "No date", dueDate: null }),
			makeProject({
				id: "later",
				name: "Later",
				dueDate: new Date("2026-09-01T00:00:00.000Z"),
			}),
			makeProject({
				id: "soon",
				name: "Soon",
				dueDate: new Date("2026-08-26T00:00:00.000Z"),
			}),
		];

		expect(
			sortProjects(projects, "due-date", "asc").map((project) => project.id),
		).toEqual(["soon", "later", "none"]);
	});

	it("uses project names as deterministic tie breakers", () => {
		const activity = new Date("2026-08-25T12:00:00.000Z");
		const projects = [
			makeProject({ id: "b", name: "Beta", lastActivityAt: activity }),
			makeProject({ id: "a", name: "Alpha", lastActivityAt: activity }),
		];

		expect(
			sortProjects(projects, "last-activity", "desc").map(
				(project) => project.name,
			),
		).toEqual(["Beta", "Alpha"]);
	});
});
