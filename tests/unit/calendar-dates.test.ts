import { describe, expect, it } from "vitest";

import {
	formatActivityDate,
	formatCalendarProjectSchedule,
	formatDateKey,
	parseDateKey,
	toDateKey,
} from "@/lib/calendar-dates";

describe("calendar date helpers", () => {
	it("parses and serializes date keys in UTC", () => {
		const date = parseDateKey("2026-08-25");

		expect(date.toISOString()).toBe("2026-08-25T00:00:00.000Z");
		expect(toDateKey(date)).toBe("2026-08-25");
	});

	it("formats date keys with and without the year", () => {
		expect(formatDateKey("2026-08-25")).toBe("Aug 25, 2026");
		expect(formatDateKey("2026-08-25", { includeYear: false })).toBe("Aug 25");
	});

	it("formats activity timestamps in UTC", () => {
		expect(formatActivityDate("2026-08-25T23:59:59.000Z")).toBe("Aug 25, 2026");
	});

	it("describes every project schedule shape", () => {
		expect(
			formatCalendarProjectSchedule({
				startDate: "2026-08-01",
				dueDate: "2026-08-31",
			}),
		).toBe("Aug 1, 2026 – Aug 31, 2026");

		expect(
			formatCalendarProjectSchedule({
				startDate: "2026-08-01",
				dueDate: null,
			}),
		).toBe("Starts Aug 1, 2026");

		expect(
			formatCalendarProjectSchedule({
				startDate: null,
				dueDate: "2026-08-31",
			}),
		).toBe("Due Aug 31, 2026");

		expect(
			formatCalendarProjectSchedule({
				startDate: null,
				dueDate: null,
			}),
		).toBe("No project dates");
	});
});
