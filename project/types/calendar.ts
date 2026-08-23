import type { ProjectAccessRole } from "@/lib/auth/project-permissions";
import type { Project, Task } from "@/lib/db/schema";
import type { UserSummary } from "@/types/user";

export type CalendarProjectTask = Pick<Task, "id" | "title" | "priority"> & {
	dueDate: string | null;
	stageName: string;
};

export type CalendarProjectSummary = {
	id: string;
	name: string;
	description: string | null;
	color: Project["color"];
	startDate: string | null;
	dueDate: string | null;
	completedAt: string | null;
	lastActivityAt: string;
	accessRole: ProjectAccessRole;
	owner: UserSummary;
	myTasks: CalendarProjectTask[];
};
