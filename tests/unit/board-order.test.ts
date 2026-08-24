import { describe, expect, it } from "vitest";

import { moveTaskInBoard, reorderStageInBoard } from "@/lib/board/board-order";
import type { StageWithTasks } from "@/types/stage";
import type { TaskWithBoardDetails } from "@/types/task";

function task(
	id: string,
	stageId: string,
	position: number,
): TaskWithBoardDetails {
	return {
		id,
		stageId,
		title: id,
		description: null,
		position,
		priority: null,
		startDate: null,
		dueDate: null,
		completedAt: null,
		archivedAt: null,
		createdAt: new Date("2026-08-01T00:00:00.000Z"),
		updatedAt: new Date("2026-08-01T00:00:00.000Z"),
		assignees: [],
		labels: [],
		comments: [],
	} as TaskWithBoardDetails;
}

function stage(
	id: string,
	position: number,
	tasks: TaskWithBoardDetails[] = [],
): StageWithTasks {
	return {
		id,
		projectId: "project",
		name: id,
		position,
		createdAt: new Date("2026-08-01T00:00:00.000Z"),
		updatedAt: new Date("2026-08-01T00:00:00.000Z"),
		tasks,
	};
}

describe("reorderStageInBoard", () => {
	it("moves a stage and normalizes positions", () => {
		const result = reorderStageInBoard(
			[stage("a", 0), stage("b", 1000), stage("c", 2000)],
			"a",
			2,
		);

		expect(result.map((item) => item.id)).toEqual(["b", "c", "a"]);
		expect(result.map((item) => item.position)).toEqual([0, 1000, 2000]);
	});

	it("clamps the requested destination", () => {
		const result = reorderStageInBoard(
			[stage("a", 0), stage("b", 1000)],
			"a",
			99,
		);

		expect(result.map((item) => item.id)).toEqual(["b", "a"]);
	});

	it("returns the same array when the stage cannot move", () => {
		const stages = [stage("a", 0), stage("b", 1000)];

		expect(reorderStageInBoard(stages, "missing", 1)).toBe(stages);
		expect(reorderStageInBoard(stages, "a", 0)).toBe(stages);
	});
});

describe("moveTaskInBoard", () => {
	it("reorders tasks inside the same stage", () => {
		const result = moveTaskInBoard(
			[
				stage("a", 0, [
					task("t1", "a", 0),
					task("t2", "a", 1000),
					task("t3", "a", 2000),
				]),
			],
			"t1",
			"a",
			2,
		);

		expect(result[0]?.tasks.map((item) => item.id)).toEqual(["t2", "t3", "t1"]);
		expect(result[0]?.tasks.map((item) => item.position)).toEqual([
			0, 1000, 2000,
		]);
	});

	it("moves a task between stages and rewrites its stage id", () => {
		const result = moveTaskInBoard(
			[
				stage("a", 0, [task("t1", "a", 0), task("t2", "a", 1000)]),
				stage("b", 1000, [task("t3", "b", 0)]),
			],
			"t2",
			"b",
			0,
		);

		expect(result[0]?.tasks.map((item) => item.id)).toEqual(["t1"]);
		expect(result[1]?.tasks.map((item) => item.id)).toEqual(["t2", "t3"]);
		expect(result[1]?.tasks[0]).toMatchObject({
			id: "t2",
			stageId: "b",
			position: 0,
		});
	});

	it("returns the original board when source or destination is invalid", () => {
		const stages = [stage("a", 0, [task("t1", "a", 0)])];

		expect(moveTaskInBoard(stages, "missing", "a", 0)).toBe(stages);
		expect(moveTaskInBoard(stages, "t1", "missing", 0)).toBe(stages);
	});
});
