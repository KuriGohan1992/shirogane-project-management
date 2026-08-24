import { describe, expect, it } from "vitest";

import {
	DEFAULT_ANALYTICS_PERIOD,
	getAnalyticsPeriodOption,
	getAnalyticsRanges,
	parseAnalyticsPeriod,
} from "@/lib/analytics";

describe("analytics periods", () => {
	it("parses supported periods and falls back for invalid values", () => {
		expect(parseAnalyticsPeriod("7d")).toBe("7d");
		expect(parseAnalyticsPeriod("90d")).toBe("90d");
		expect(parseAnalyticsPeriod("invalid")).toBe(DEFAULT_ANALYTICS_PERIOD);
		expect(parseAnalyticsPeriod()).toBe(DEFAULT_ANALYTICS_PERIOD);
	});

	it("returns the matching period metadata", () => {
		expect(getAnalyticsPeriodOption("12m")).toMatchObject({
			value: "12m",
			days: 365,
			bucket: "month",
		});
	});

	it("creates adjacent current and previous UTC ranges", () => {
		const ranges = getAnalyticsRanges(
			"7d",
			new Date("2026-08-25T18:42:15.000Z"),
		);

		expect(ranges.currentStart.toISOString()).toBe("2026-08-19T00:00:00.000Z");
		expect(ranges.currentEnd.toISOString()).toBe("2026-08-26T00:00:00.000Z");
		expect(ranges.previousStart.toISOString()).toBe("2026-08-12T00:00:00.000Z");
		expect(ranges.previousEnd.toISOString()).toBe("2026-08-19T00:00:00.000Z");
	});
});
