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
		<div className="relative min-w-0 overflow-hidden rounded-xl border border-border bg-card">
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 h-4"
				style={{
					backgroundColor: getColorHex(project.color),
				}}
			/>

			<div className="p-5 pt-7 sm:p-6 sm:pt-7">
				<div
					className={cn(
						"grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3",
						headerActions && hasProjectAdminActions
							? "sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
							: "sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
					)}
				>
					<div className="flex min-w-0 items-center gap-2.5">
						<h1
							title={project.name}
							className="min-w-0 flex-1 truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
						>
							{project.name}
						</h1>

						{project.completedAt && (
							<span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
								Completed
							</span>
						)}
					</div>

					{headerActions && (
						<div
							className={cn(
								"col-span-2 row-start-2 flex min-w-0 justify-start sm:justify-end",
								"sm:col-span-1 sm:col-start-2 sm:row-start-1",
							)}
						>
							{headerActions}
						</div>
					)}

					{hasProjectAdminActions && (
						<div
							className={cn(
								"col-start-2 row-start-1 flex justify-end",
								headerActions && "sm:col-start-3",
							)}
						>
							<ProjectActions
								project={toEditableProject(project)}
								canEdit={permissions.canEditProject}
								canDelete={permissions.canDeleteProject}
								canComplete={permissions.canCompleteProject}
								isCompleted={project.completedAt !== null}
								compact
								menuSize="header"
							/>
						</div>
					)}
				</div>

				<p className="mt-3 max-w-5xl text-sm leading-6 text-muted-foreground sm:line-clamp-3">
					{project.description || "No project description yet."}
				</p>

				<div
					className={cn(
						"mt-5 divide-y divide-border border-t border-border sm:grid sm:divide-x sm:divide-y-0 sm:pt-4",
						showOwner ? "sm:grid-cols-4" : "sm:grid-cols-3",
					)}
				>
					<div className="flex min-w-0 items-center gap-3 py-3 sm:py-0 sm:pr-4">
						<CalendarRange
							aria-hidden="true"
							className="size-[18px] shrink-0 text-muted-foreground"
						/>

						<div className="min-w-0">
							<p className="text-xs font-medium text-muted-foreground">
								Schedule
							</p>

							<p className="break-words text-sm font-medium text-foreground sm:truncate">
								{formatProjectSchedule(project)}
							</p>
						</div>
					</div>

					<div className="flex min-w-0 items-center gap-3 py-3 sm:px-4 sm:py-0">
						<Clock3
							aria-hidden="true"
							className="size-[18px] shrink-0 text-muted-foreground"
						/>

						<div className="min-w-0">
							<p className="text-xs font-medium text-muted-foreground">
								Last activity
							</p>

							<p className="text-sm font-medium text-foreground sm:truncate">
								{formatDate(lastActivityAt)}
							</p>
						</div>
					</div>

					<div className="flex min-w-0 items-center gap-3 py-3 sm:px-4 sm:py-0">
						<ShieldCheck
							aria-hidden="true"
							className="size-[18px] shrink-0 text-muted-foreground"
						/>

						<div className="min-w-0">
							<p className="text-xs font-medium text-muted-foreground">
								Your role
							</p>

							<p className="text-sm font-medium capitalize text-foreground sm:truncate">
								{accessRole}
							</p>
						</div>
					</div>

					{showOwner && (
						<div className="flex min-w-0 items-center gap-3 py-3 sm:py-0 sm:pl-4">
							<UserAvatar user={owner} className="size-7 shrink-0" />

							<div className="min-w-0">
								<p className="text-xs font-medium text-muted-foreground">
									Owner
								</p>

								<p className="break-words text-sm font-medium text-foreground sm:truncate">
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
