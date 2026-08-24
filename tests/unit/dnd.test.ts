import { describe, expect, it } from "vitest";

import {
	getStageDndId,
	getStageIdFromDndId,
	getStageIdFromTaskDropZoneDndId,
	getStageTaskDropZoneDndId,
	getTaskDndId,
	getTaskIdFromDndId,
} from "@/lib/board/dnd";

describe("board drag-and-drop identifiers", () => {
	it("round-trips stage identifiers", () => {
		expect(getStageIdFromDndId(getStageDndId("stage-1"))).toBe("stage-1");
	});

	it("round-trips task identifiers", () => {
		expect(getTaskIdFromDndId(getTaskDndId("task-1"))).toBe("task-1");
	});

	it("round-trips stage task drop-zone identifiers", () => {
		expect(
			getStageIdFromTaskDropZoneDndId(getStageTaskDropZoneDndId("stage-2")),
		).toBe("stage-2");
	});

	it("rejects identifiers from the wrong drag type", () => {
		expect(getStageIdFromDndId("task:123")).toBeUndefined();
		expect(getTaskIdFromDndId("stage:123")).toBeUndefined();
		expect(getStageIdFromTaskDropZoneDndId("stage:123")).toBeUndefined();
	});

	it("accepts numeric identifiers without throwing", () => {
		expect(getStageIdFromDndId(123)).toBeUndefined();
		expect(getTaskIdFromDndId(123)).toBeUndefined();
	});
});
