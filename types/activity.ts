import type { ActivityLog } from "@/lib/db/schema";
import type { UserSummary } from "@/types/user";

export type ActivityWithActor = ActivityLog & {
	actor: UserSummary | null;
};

export type TaskActivityWithActor = ActivityWithActor;
