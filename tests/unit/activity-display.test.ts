import { describe, expect, it } from "vitest";

import { getActivityMessage } from "@/lib/activity-display";
import type { ActivityWithActor } from "@/types/activity";

function activity(
	action: ActivityWithActor["action"],
	metadata: ActivityWithActor["metadata"] = {},
): ActivityWithActor {
	return {
		id: "activity",
		projectId: "project",
		taskId: null,
		actorId: "actor",
		action,
		metadata,
		createdAt: new Date("2026-08-25T00:00:00.000Z"),
		actor: null,
	};
}

describe("getActivityMessage", () => {
	it("formats project lifecycle activity", () => {
		expect(getActivityMessage(activity("project_created"))).toBe(
			"created this project",
		);
		expect(
			getActivityMessage(
				activity("project_updated", { changedFields: "name, due date" }),
			),
		).toBe("updated project name, due date");
	});

	it("formats stage rename details when both names are known", () => {
		expect(
			getActivityMessage(
				activity("stage_renamed", {
					previousStageName: "Todo",
					stageName: "To Do",
				}),
			),
		).toBe("renamed the Todo stage to To Do");
	});

	it("formats collaborator role changes", () => {
		expect(
			getActivityMessage(
				activity("member_role_updated", {
					memberName: "Pat",
					previousMemberRole: "member",
					memberRole: "viewer",
				}),
			),
		).toBe("changed Pat from Member to Viewer");
	});

	it("formats task movement and task names", () => {
		expect(
			getActivityMessage(
				activity("task_moved", {
					taskTitle: "Ship MVP",
					fromStage: "Review",
					toStage: "Done",
				}),
			),
		).toBe("moved “Ship MVP” from Review to Done");
	});

	it("uses a generic task label when old activity lacks a title", () => {
		expect(getActivityMessage(activity("task_completed"))).toBe(
			"completed a task",
		);
	});
});
