import { CalendarRange, Clock3, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { ProjectActions } from "@/components/project-actions";
import { UserAvatar } from "@/components/user-avatar";
import type { ProjectPermissions } from "@/lib/auth/project-permissions";
import { getColorHex } from "@/lib/constants/colors";
import type { Project } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { EditableProject } from "@/types/project";
import type { UserSummary } from "@/types/user";

type ProjectHeaderProps = {
	project: Project;
	permissions: ProjectPermissions;
	accessRole: "owner" | "member" | "viewer";
	owner: UserSummary;
	lastActivityAt: Date;
	headerActions?: ReactNode;
};

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function formatProjectSchedule(project: Project) {
	if (project.startDate && project.dueDate) {
		return `${formatDate(project.startDate)} – ${formatDate(project.dueDate)}`;
	}

	if (project.startDate) {
		return `Starts ${formatDate(project.startDate)}`;
	}

	if (project.dueDate) {
		return `Due ${formatDate(project.dueDate)}`;
	}

	return "No project dates";
}

function toEditableProject(project: Project): EditableProject {
	return {
		id: project.id,
		name: project.name,
		description: project.description ?? "",
		color: project.color,
		startDate: project.startDate?.toISOString().slice(0, 10) ?? "",
		dueDate: project.dueDate?.toISOString().slice(0, 10) ?? "",
	};
}

export function ProjectHeader({
	project,
	permissions,
	accessRole,
	owner,
	lastActivityAt,
	headerActions,
}: ProjectHeaderProps) {
	const hasProjectAdminActions =
		permissions.canEditProject ||
		permissions.canDeleteProject ||
		permissions.canCompleteProject;

	const showOwner = accessRole !== "owner";

	return (
		<div className="relative overflow-hidden rounded-xl border border-border bg-card">
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 h-4"
				style={{
					backgroundColor: getColorHex(project.color),
				}}
			/>

			<div className="p-6 pt-7">
				<div className="flex min-w-0 items-start gap-4">
					<div className="flex min-w-0 flex-1 items-center gap-3">
						<h1
							title={project.name}
							className="min-w-0 truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
						>
							{project.name}
						</h1>

						{project.completedAt && (
							<span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
								Completed
							</span>
						)}
					</div>

					{(headerActions || hasProjectAdminActions) && (
						<div className="flex shrink-0 items-center gap-2">
							{headerActions}

							{headerActions && hasProjectAdminActions && (
								<div
									aria-hidden="true"
									className="h-6 w-px shrink-0 bg-border ml-2"
								/>
							)}

							{hasProjectAdminActions && (
								<ProjectActions
									project={toEditableProject(project)}
									canEdit={permissions.canEditProject}
									canDelete={permissions.canDeleteProject}
									canComplete={permissions.canCompleteProject}
									isCompleted={project.completedAt !== null}
									compact
								/>
							)}
						</div>
					)}
				</div>

				<p className="mt-3 max-w-5xl line-clamp-3 text-sm leading-6 text-muted-foreground">
					{project.description || "No project description yet."}
				</p>

				<div
					className={cn(
						"mt-5 grid divide-x divide-border border-t border-border pt-4",
						showOwner ? "grid-cols-4" : "grid-cols-3",
					)}
				>
					<div className="flex min-w-0 items-center gap-3 pr-4">
						<CalendarRange
							aria-hidden="true"
							className="size-[18px] shrink-0 text-muted-foreground"
						/>

						<div className="min-w-0">
							<p className="text-xs font-medium text-muted-foreground">
								Schedule
							</p>

							<p className="truncate text-sm font-medium text-foreground">
								{formatProjectSchedule(project)}
							</p>
						</div>
					</div>

					<div className="flex min-w-0 items-center gap-3 px-4">
						<Clock3
							aria-hidden="true"
							className="size-[18px] shrink-0 text-muted-foreground"
						/>

						<div className="min-w-0">
							<p className="text-xs font-medium text-muted-foreground">
								Last activity
							</p>

							<p className="truncate text-sm font-medium text-foreground">
								{formatDate(lastActivityAt)}
							</p>
						</div>
					</div>

					<div className="flex min-w-0 items-center gap-3 px-4">
						<ShieldCheck
							aria-hidden="true"
							className="size-[18px] shrink-0 text-muted-foreground"
						/>

						<div className="min-w-0">
							<p className="text-xs font-medium text-muted-foreground">
								Your role
							</p>

							<p className="truncate text-sm font-medium capitalize text-foreground">
								{accessRole}
							</p>
						</div>
					</div>

					{showOwner && (
						<div className="flex min-w-0 items-center gap-3 pl-4">
							<UserAvatar user={owner} className="size-7 shrink-0" />

							<div className="min-w-0">
								<p className="text-xs font-medium text-muted-foreground">
									Owner
								</p>

								<p className="truncate text-sm font-medium text-foreground">
									{owner.name ?? owner.email}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
