import type { ActivityLog } from "@/lib/db/schema";
import type { UserSummary } from "@/types/user";

export type TaskActivityWithActor = ActivityLog & {
	actor: UserSummary | null;
};
