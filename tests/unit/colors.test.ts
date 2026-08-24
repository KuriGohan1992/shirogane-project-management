import { describe, expect, it } from "vitest";

import { COLOR_OPTIONS, getColorHex } from "@/lib/constants/colors";

describe("project colors", () => {
	it("returns the configured hex value for every known color", () => {
		for (const option of COLOR_OPTIONS) {
			expect(getColorHex(option.value)).toBe(option.hex);
		}
	});

	it("falls back to the first configured color", () => {
		expect(getColorHex("unknown")).toBe(COLOR_OPTIONS[0]?.hex);
	});
});
